import { readFile } from "node:fs/promises";

import { Client } from "@elastic/elasticsearch";
import cliProgress from "cli-progress";
import { fdir } from "fdir";
import * as cheerio from "cheerio";

import { Doc, ProseSection } from "../libs/types/document.js";

class IndexAliasError extends Error {
  // When there's something wrong with finding the index alias.
}

class Counter {
  map: Map<string, number>;

  constructor() {
    this.map = new Map();
  }

  count(errorKey: string) {
    const current = this.map.get(errorKey) ?? 0;
    this.map.set(errorKey, current + 1);
  }

  mostCommon(): [string, number][] {
    return [...this.map.entries()].sort((a, b) => b[1] - a[1]);
  }
}

type UpdateAliasAction =
  | {
      add: {
        index: string;
        alias: string;
      };
    }
  | {
      remove: {
        index: string;
        alias?: string;
      };
    };

// Note, this is the name that the Kuma code will use when sending Elasticsearch
// search queries.
// We always build an index that is called something based on this name but with
// the _YYYYMMDDHHMMSS date suffix.
const INDEX_ALIAS_NAME = "mdn_docs";

export async function searchIndex(
  buildroot: string,
  url: string,
  options: {
    update: boolean;
    noProgressbar: boolean;
  }
): Promise<void> {
  const client = new Client({
    node: url,
  });
  const health = await client.cluster.health();
  const status = health.body.status;
  if (!["green", "yellow"].includes(status)) {
    throw new Error(`status ${status} not green or yellow`);
  }

  const files = await walk(buildroot);

  const countTodo = files.length;
  console.info(`Found ${countTodo} (potential) documents to index`);

  async function getIndexName() {
    if (options.update) {
      const records = await client.cat.aliases();
      const record = records.find((record) =>
        record.alias.startsWith(`${INDEX_ALIAS_NAME}_`)
      );

      if (!record) {
        throw new IndexAliasError(
          `Unable to find an index called ${INDEX_ALIAS_NAME}_*`
        );
      }

      return record.index;
    } else {
      const newIndexName = createIndexName();
      console.info(
        `Deleting any possible existing index and creating a new one called ${newIndexName}`
      );
      await client.indices.delete({ index: newIndexName }, { ignore: [404] });
      await client.indices.create({ index: newIndexName });

      return newIndexName;
    }
  }

  const documentIndex = await getIndexName();

  const skipped = [];

  async function* generator() {
    for (const file of files) {
      // The reason for specifying the exact index name is that we might
      // be doing an update and if you don't specify it, elasticsearch_dsl
      // will fall back to using whatever Document._meta.Index automatically
      // becomes in this moment.
      const searchDoc = await toSearch(file, documentIndex);
      if (searchDoc) {
        yield searchDoc;
      } else {
        // The reason something might be chosen to be skipped is because
        // there's logic that kicks in only when the `index.json` file
        // has been opened and parsed.
        // Keep a count of all of these. It's used to make sure the
        // progressbar, if used, ticks as many times as the estimate
        // count was.
        skipped.push(1);
      }
    }
  }

  function getProgressbar() {
    if (options.noProgressbar) {
      return {
        update: () => {
          // Nothing.
        },
      };
      // return VoidProgressBar()
    }

    const progressBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_grey
    );
    progressBar.start(countTodo, 0);
    return {
      update: progressBar.increment,
    };
  }

  let countDone = 0;
  let countWorked = 0;
  let countErrors = 0;
  let countShardsWorked = 0;
  let countShardsFailed = 0;
  const errorsCounter = new Counter();
  const t0 = Date.now() / 1000;

  const bar = getProgressbar();

  const items = await parallelBulk(client, generator());

  for (const item of items) {
    const { index } = item;

    if (index.error) {
      countErrors += 1;
      errorsCounter.count(`${index.error.type}: ${index.error.reason}`);
    } else {
      countShardsWorked += index._shards.successful;
      countShardsFailed += index._shards.failed;
      countWorked += 1;
    }

    countDone += 1;
    bar.update(1);
  }

  bar.update(skipped.length);

  // Now when the index has been filled, we need to make sure we
  // correct any previous indexes.
  if (options.update) {
    // When you do an update, Elasticsearch will internally delete the
    // previous docs (based on the _id primary key we set).
    // Normally, Elasticsearch will do this when you restart the cluster
    // but that's not something we usually do.
    // See https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-forcemerge.html
    client.indices.forcemerge({ index: documentIndex });
  } else {
    // Now we're going to bundle the change to set the alias to point
    // to the new index and delete all old indexes.
    // The reason for doing this together in one update is to make it atomic.
    const actions: UpdateAliasAction[] = [];

    actions.push({
      add: {
        index: documentIndex,
        alias: INDEX_ALIAS_NAME,
      },
    });

    for (const index_name in await client.cat.aliases()) {
      if (index_name.startsWith(`${INDEX_ALIAS_NAME}_`)) {
        if (index_name !== documentIndex) {
          actions.push({ remove: { index: index_name } });
          console.info(`Delete old index ${index_name}`);
        }
      }
    }

    await client.indices.updateAliases({ actions });
    console.info(
      `Reassign the ${INDEX_ALIAS_NAME} alias from old index to ${documentIndex}`
    );
  }

  const t1 = Date.now() / 1000;
  const took = t1 - t0;
  const rate = countDone / took;
  console.info(
    `Took ${formatTime(
      took
    )} to index ${countDone} documents. Approximately ${round(
      rate,
      2
    )} docs/second`
  );
  console.info(
    `Count shards - successful: ${countShardsWorked} failed: ${countShardsFailed}`
  );
  console.info(`Counts - worked: ${countWorked} errors: ${countErrors}`);
  if (errorsCounter) {
    console.info("Most common errors...");
    for (const entry in errorsCounter.mostCommon()) {
      const [error, count] = entry;
      console.info(`${count}\t${error.substring(0, 80)}`);
    }
  }
}

async function walk(root: string) {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith("index.json"))
    .crawl(root);
  return api.withPromise();
}

function createIndexName(): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${INDEX_ALIAS_NAME}_${timestamp}`;
}

function isDoc(value: any): value is { doc: Doc } {
  if ("blogMeta" in value) {
    // Skip blog content for now.
    return false;
  }
  if (!("doc" in value)) {
    // If the file we just opened isn't use for documents, it might be for
    // other SPAs like the home page. Skip these.
    return false;
  }

  return true;
}

async function toSearch(file: string, index: string) {
  const json = await readFile(file, "utf-8");
  const data = JSON.parse(json);
  if (!isDoc(data)) {
    return;
  }
  const doc = data.doc;
  const [locale, slug] = doc.mdn_url.substring(1).split("/docs/", 2);
  if (slug.endsWith("/Index")) {
    // We have a lot of pages that uses the `{{Index(...)}}` kumascript macro
    // which can produce enormous pages whose content is rather useless
    // because it's only an index and thus should appear, individually,
    // elsewhere. Just skip these.
    // E.g. https://developer.allizom.org/en-US/docs/Web/API/Index
    // See also https://github.com/mdn/yari/issues/1786
    return;
  }
  if (doc.noIndexing) {
    return;
  }

  return {
    _index: index,
    _id: doc.mdn_url,
    title: doc.title,
    body: htmlStrip(
      doc.body
        .filter((section): section is ProseSection => section.type === "prose")
        .map((section) => section.value.content)
        .filter(Boolean)
        .join("\n")
    ),
    popularity: doc.popularity,
    summary: doc.summary,
    slug: slug.toLowerCase(),
    locale: locale.toLowerCase(),
  };
}

async function parallelBulk(
  client: Client,
  items: AsyncGenerator<
    {
      _index: string;
      _id: string;
      title: string;
      body: string;
      popularity: number;
      summary: string;
      slug: string;
      locale: string;
    },
    void,
    unknown
  >
) {
  const body = [];

  for await (const item of items) {
    body.push(item);
  }

  const bulkResponse = await client.bulk({ body });

  return bulkResponse.items;
}

function formatTime(seconds: number) {
  const parts: string[] = [];
  const hours = Math.floor(seconds / 3600);
  if (hours) {
    parts.push(`${hours}h`);
  }
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  if (minutes) {
    parts.push(`${minutes}m`);
  }
  seconds -= minutes * 60;
  if (seconds) {
    parts.push(`${seconds}s`);
  }
  return parts.join(" ");
}

function round(x: number, digits: number) {
  const pow = Math.pow(10, digits);
  return Math.round(x * pow) / pow;
}

const DISPLAY_NONE_REGEX = /display:\s*none/;

export function htmlStrip(html: string): string {
  html = html.trim();

  if (!html) {
    return "";
  }

  const $ = cheerio.load(html);

  $("div.warning, div.hidden, p.hidden").remove();

  $("div[style]").each((i, el) => {
    const style = el.attribs["style"];
    if (style && DISPLAY_NONE_REGEX.test(style)) {
      $(el).remove();
    }
  });

  const text = $.text().trim().replace(/\r\n?/g, "\n");

  return text;
}
