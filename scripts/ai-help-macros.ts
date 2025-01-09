import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import caporal from "@caporal/core";
import pg from "pg";
import pgvector from "pgvector/pg";
import { fdir } from "fdir";
import OpenAI from "openai";
import { load as cheerio, CheerioAPI } from "cheerio";

import { DocMetadata } from "../libs/types/document.js";
import { BUILD_OUT_ROOT, OPENAI_KEY, PG_URI } from "../libs/env/index.js";
import {
  getBCDDataForPath,
  SimpleSupportStatementExtended,
} from "@mdn/bcd-utils-api";
import path from "node:path";
import {
  BrowserStatement,
  SimpleSupportStatement,
  VersionValue,
} from "@mdn/browser-compat-data/types";
import { h2mSync } from "../markdown/index.js";
import { Doc as JSONDoc } from "../libs/types/document.js";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_MODEL_NEXT = "text-embedding-3-small";

const { program } = caporal;

interface IndexedDoc {
  id: number;
  mdn_url: string;
  title: string;
  token_count: number | null;
  has_embedding: boolean;
  has_embedding_next: boolean;
  markdown_hash: string;
  text_hash: string;
}

interface Doc {
  mdn_url: string;
  title: string;
  title_short: string;
  markdown: string;
  markdown_hash: string;
  text?: string;
  text_hash?: string;
}

type FormattingUpdate = Pick<
  Doc,
  "mdn_url" | "title" | "title_short" | "markdown" | "markdown_hash"
>;

type EmbeddingUpdate = Pick<Doc, "mdn_url" | "text"> & {
  has_embedding: boolean;
  has_embedding_next: boolean;
};

export async function updateEmbeddings(
  directory: string,
  updateFormatting: boolean,
  usePlainHtml: boolean
) {
  if (!OPENAI_KEY || !PG_URI) {
    throw Error("Please set these environment variables: OPENAI_KEY, PG_URI");
  }

  // Postgres.
  const pgClient = new pg.Client({
    connectionString: PG_URI,
  });

  await pgClient.connect();
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pgvector.registerType(pgClient);

  // Open AI.
  const openai = new OpenAI({
    apiKey: OPENAI_KEY,
  });

  const createEmbedding = async (input: string, model: string) => {
    let embeddingResponse: OpenAI.Embeddings.CreateEmbeddingResponse;
    try {
      embeddingResponse = await openai.embeddings.create({
        model,
        input,
      });
    } catch ({ error: { message, type }, status }: any) {
      console.error(
        `[!] Failed to create embedding (${status}): ${type} - ${message}`
      );
      // Try again with trimmed content.
      embeddingResponse = await openai.embeddings.create({
        model,
        input: input.substring(0, 15000),
      });
    }

    const {
      data: [{ embedding }],
      usage: { total_tokens },
    } = embeddingResponse;

    return {
      total_tokens,
      embedding,
    };
  };

  console.log(`Retrieving all indexed documents...`);
  const existingDocs = await fetchAllExistingDocs(pgClient);
  console.log(`-> Done.`);

  const existingDocByUrl = new Map<string, IndexedDoc>(
    existingDocs.map((doc) => [doc.mdn_url, doc])
  );

  console.log(`Determining changed and deleted documents...`);

  const seenUrls = new Set<string>();
  const updates: Doc[] = [];
  const formattingUpdates: FormattingUpdate[] = [];
  const embeddingUpdates: EmbeddingUpdate[] = [];

  for await (const { mdn_url, title, title_short, markdown, text } of builtDocs(
    directory,
    usePlainHtml
  )) {
    seenUrls.add(mdn_url);

    // Check for existing document in DB and compare checksums.
    const existingDoc = existingDocByUrl.get(mdn_url);

    const text_hash = createHash("sha256").update(text).digest("base64");
    const markdown_hash = createHash("sha256")
      .update(markdown)
      .digest("base64");

    if (existingDoc?.text_hash !== text_hash) {
      // Document added or content changed => (re)generate embeddings.
      updates.push({
        mdn_url,
        title,
        title_short,
        markdown,
        markdown_hash,
        text,
        text_hash,
      });
    } else {
      if (updateFormatting || existingDoc?.markdown_hash !== markdown_hash) {
        // Document formatting changed => update markdown.
        formattingUpdates.push({
          mdn_url,
          title,
          title_short,
          markdown,
          markdown_hash,
        });
      }

      if (
        !existingDoc.has_embedding ||
        !existingDoc.has_embedding_next !== !EMBEDDING_MODEL_NEXT
      ) {
        // Embedding missing => add embeddings.
        const { has_embedding, has_embedding_next } = existingDoc;
        embeddingUpdates.push({
          mdn_url,
          text,
          has_embedding,
          has_embedding_next,
        });
      }
    }
  }

  console.log(
    `-> ${updates.length} (${formattingUpdates.length}) of ${seenUrls.size} documents were changed or added (or formatted).`
  );
  if (embeddingUpdates.length > 0) {
    console.log(
      `-> ${embeddingUpdates.length} documents have outdated embeddings.`
    );
  }

  const deletions: IndexedDoc[] = [...existingDocByUrl.entries()]
    .filter(([key]) => !seenUrls.has(key))
    .map(([, value]) => value);
  console.log(
    `-> ${deletions.length} of ${existingDocs.length} indexed documents were deleted (or moved).`
  );

  if (
    updates.length > 0 ||
    formattingUpdates.length > 0 ||
    embeddingUpdates.length > 0
  ) {
    console.log(`Applying updates...`);
    for (const {
      mdn_url,
      title,
      title_short,
      markdown,
      markdown_hash,
      text,
      text_hash,
    } of updates) {
      try {
        console.log(`-> [${mdn_url}] Updating document...`);

        // Embedding for full document.
        const [{ total_tokens, embedding }, embedding_next] = await Promise.all(
          [
            createEmbedding(text, EMBEDDING_MODEL),
            EMBEDDING_MODEL_NEXT && EMBEDDING_MODEL_NEXT !== EMBEDDING_MODEL
              ? createEmbedding(text, EMBEDDING_MODEL_NEXT).then(
                  ({ embedding }) => embedding
                )
              : null,
          ]
        );

        // Create/update document record.
        const query = {
          name: "upsert-embedding-doc",
          text: `
            INSERT INTO mdn_doc_macro(
                    mdn_url,
                    title,
                    title_short,
                    markdown,
                    markdown_hash,
                    token_count,
                    embedding,
                    embedding_next,
                    text_hash
                )
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (mdn_url) DO
            UPDATE
            SET mdn_url = $1,
                title = $2,
                title_short = $3,
                markdown = $4,
                markdown_hash = $5,
                token_count = $6,
                embedding = $7,
                embedding_next = $8,
                text_hash = $9
          `,
          values: [
            mdn_url,
            title,
            title_short,
            markdown,
            markdown_hash,
            total_tokens,
            pgvector.toSql(embedding),
            pgvector.toSql(embedding_next ?? embedding),
            text_hash,
          ],
          rowMode: "array",
        };

        await pgClient.query(query);
      } catch (err: any) {
        console.error(`!> [${mdn_url}] Failed to update document.`);
        const context = err?.response?.data ?? err?.response ?? err;
        console.error(context);
      }
    }

    for (const {
      mdn_url,
      title,
      title_short,
      markdown,
      markdown_hash,
    } of formattingUpdates) {
      try {
        console.log(
          `-> [${mdn_url}] Updating document without generating new embedding...`
        );

        // Create/update document record.
        const query = {
          name: "upsert-doc",
          text: `
            INSERT INTO mdn_doc_macro(mdn_url, title, title_short, markdown, markdown_hash)
            VALUES($1, $2, $3, $4, $5) ON CONFLICT (mdn_url) DO
            UPDATE
            SET mdn_url = $1,
                title = $2,
                title_short = $3,
                markdown = $4,
                markdown_hash = $5
          `,
          values: [mdn_url, title, title_short, markdown, markdown_hash],
          rowMode: "array",
        };

        await pgClient.query(query);
      } catch (err: any) {
        console.error(`!> [${mdn_url}] Failed to update document.`);
        const context = err?.response?.data ?? err?.response ?? err;
        console.error(context);
      }
    }

    for (const {
      mdn_url,
      text,
      has_embedding,
      has_embedding_next,
    } of embeddingUpdates) {
      try {
        console.log(`-> [${mdn_url}] Updating embeddings...`);

        if (!has_embedding) {
          const { total_tokens, embedding } = await createEmbedding(
            text,
            EMBEDDING_MODEL
          );

          const query = {
            name: "upsert-doc-embedding",
            text: "UPDATE mdn_doc_macro SET total_tokens = $2, embedding = $3 WHERE mdn_url = $1",
            values: [
              mdn_url,
              total_tokens,
              embedding ? pgvector.toSql(embedding) : null,
            ],
            rowMode: "array",
          };

          await pgClient.query(query);
        }

        if (!has_embedding_next) {
          const embedding = EMBEDDING_MODEL_NEXT
            ? (await createEmbedding(text, EMBEDDING_MODEL_NEXT)).embedding
            : null;

          const query = {
            name: "upsert-doc-embedding-next",
            text: "UPDATE mdn_doc_macro SET embedding_next = $2 WHERE mdn_url = $1",
            values: [mdn_url, embedding ? pgvector.toSql(embedding) : null],
            rowMode: "array",
          };

          await pgClient.query(query);
        }
      } catch (err: any) {
        console.error(`!> [${mdn_url}] Failed to add embeddings.`);
        const context = err?.response?.data ?? err?.response ?? err;
        console.error(context);
      }
    }

    console.log(`-> Done.`);
  }

  if (deletions.length > 0) {
    console.log(`Applying deletions...`);
    for (const { id, mdn_url } of deletions) {
      console.log(`-> [${mdn_url}] Deleting indexed document...`);
      const query = {
        name: "delete-doc",
        text: `DELETE from mdn_doc_macro WHERE id = $1`,
        values: [id],
        rowMode: "array",
      };

      await pgClient.query(query);
    }
    console.log(`-> Done.`);
  }
  pgClient.end();
}

async function formatDocs(directory: string, usePlainHtml: boolean) {
  for await (const { markdown, text } of builtDocs(directory, usePlainHtml)) {
    console.log(markdown, text);
  }
}

async function* builtPaths(directory: string) {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith("metadata.json"))
    .crawl(directory);

  const paths = await api.withPromise();

  for (const path of paths) {
    yield path;
  }
}

async function* builtDocs(directory: string, usePlainHtml: boolean) {
  for await (const metadataPath of builtPaths(directory)) {
    try {
      const raw = await readFile(metadataPath, "utf-8");
      const { title, short_title, mdn_url, hash } = JSON.parse(
        raw
      ) as DocMetadata;
      let $: CheerioAPI;

      if (usePlainHtml) {
        const plainPath = path.join(path.dirname(metadataPath), "plain.html");
        const plainHTML = await readFile(plainPath, "utf-8");

        // reformat HTML version, used as context
        $ = cheerio(plainHTML);
      } else {
        const jsonPath = path.join(path.dirname(metadataPath), "index.json");
        const json = JSON.parse(await readFile(jsonPath, "utf-8"));
        const doc = json.doc as JSONDoc;

        // Assemble the interim HTML from the json data
        $ = cheerio("<html><head></head><body></body></html>");
        for (const section of doc.body) {
          const tag = section.value.isH3 ? "h3" : "h2";
          if (section.value.title) {
            $("body").append("\n");
            $("body").append(
              `<${tag} id="${section.value.id ?? ""}">${section.value.title}</${tag}>`
            );
          }
          switch (section.type) {
            case "prose": {
              $("body").append("\n");
              $("body").append(section.value.content);
              break;
            }
            case "specifications":
              break;
            case "browser_compatibility": {
              $("body").append("\n");
              $("body").append(
                ` <div>${buildBCDTable(section.value.query)}</div> `
              );
              break;
            }
          }
        }
        $("span.language-name").remove();
      }
      $("#specifications, .bc-specs").remove();
      $("body").prepend(`<h1>${title}</h1>`);
      $("head").prepend(`<title>${title}</title>`);
      $("head").prepend(`<link rel="canonical" href="${mdn_url}" />`);
      $("[width], [height]").each((_, el) => {
        $(el).removeAttr("width").removeAttr("height");
      });
      $(".bc-data[data-query]").each((_, el) => {
        $(el).replaceWith(buildBCDTable($(el).data("query") as string));
      });

      const html = $.html();
      const markdown = h2mSync(html);

      // reformat text version, used for embedding
      $("title").remove();
      $("#browser_compatibility, .bc-table").remove();
      const text = $.text().trim().replace(/\n+/g, "\n");

      yield {
        mdn_url,
        title,
        title_short: short_title || title,
        hash,
        markdown,
        text,
      };
    } catch (e) {
      console.error(`Error preparing doc: ${metadataPath}`, e);
    }
  }
}

function buildBCDTable(query: string) {
  const bcdData = getBCDDataForPath(query);
  if (!bcdData) return "";
  const { browsers, data } = bcdData;
  return data.__compat?.support
    ? `<table class="bc-table">
<thead><tr><th>Browser</th><th>Support</th>
<tbody>
${Object.entries(data.__compat?.support)
  .map(
    ([browser, support]) =>
      `<tr><td>${browsers[browser].name}</td><td>${buildBCDSupportString(
        browsers[browser],
        support
      )}</td></tr>`
  )
  .join("\n")}
</tbody>
</table>`
    : "";
}

function buildBCDSupportString(
  browser: BrowserStatement,
  support: (SimpleSupportStatement & SimpleSupportStatementExtended)[]
) {
  return support
    .flatMap((item) => {
      return [
        item.version_removed &&
        !support.some(
          (otherItem) => otherItem.version_added === item.version_removed
        )
          ? `Removed in ${labelFromString(
              item.version_removed,
              browser
            )} and later`
          : null,
        item.partial_implementation ? "Partial support" : null,
        item.prefix
          ? `Implemented with the vendor prefix: ${item.prefix}`
          : null,
        item.alternative_name
          ? `Alternate name: ${item.alternative_name}`
          : null,
        item.flags ? FlagsNote(item, browser) : null,
        item.notes
          ? (Array.isArray(item.notes) ? item.notes : [item.notes]).join(". ")
          : null,
        versionIsPreview(item.version_added, browser)
          ? "Preview browser support"
          : null,
        isFullySupportedWithoutLimitation(item) &&
        !versionIsPreview(item.version_added, browser)
          ? `Full support since version ${item.version_added}${
              item.release_date ? ` (released ${item.release_date})` : ""
            }`
          : isNotSupportedAtAll(item)
            ? "No support"
            : null,
      ]
        .flat()
        .filter((x) => Boolean(x));
    })
    .join(". ");
}

function labelFromString(
  version: string | boolean | null | undefined,
  browser: BrowserStatement
) {
  if (typeof version !== "string") {
    return "?";
  }
  // Treat BCD ranges as exact versions to avoid confusion for the reader
  // See https://github.com/mdn/yari/issues/3238
  if (version.startsWith("≤")) {
    return version.slice(1);
  }
  if (version === "preview") {
    return browser.preview_name;
  }
  return version;
}

function FlagsNote(
  supportItem: SimpleSupportStatement,
  browser: BrowserStatement
) {
  const hasAddedVersion = typeof supportItem.version_added === "string";
  const hasRemovedVersion = typeof supportItem.version_removed === "string";
  const flags = supportItem.flags || [];
  return `${
    hasAddedVersion ? `From version ${supportItem.version_added}` : ""
  }${
    hasRemovedVersion
      ? `${hasAddedVersion ? " until" : "Until"} version ${
          supportItem.version_removed
        } (exclusive)`
      : ""
  }${
    hasAddedVersion || hasRemovedVersion ? ": this" : "This"
  } feature is behind the ${flags.map((flag, i) => {
    const valueToSet = flag.value_to_set
      ? ` (needs to be set to <code>${flag.value_to_set}</code>)`
      : "";
    return `<code>${flag.name}</code>${
      flag.type === "preference" ? ` preference${valueToSet}` : ""
    }${flag.type === "runtime_flag" ? ` runtime flag${valueToSet}` : ""}${
      i < flags.length - 1 ? " and the " : ""
    }`;
  })}.${
    browser.pref_url && flags.some((flag) => flag.type === "preference")
      ? ` To change preferences in ${browser.name}, visit ${browser.pref_url}.`
      : ""
  }`;
}

function versionIsPreview(
  version: VersionValue | string | undefined,
  browser: BrowserStatement
): boolean {
  if (version === "preview") {
    return true;
  }

  if (browser && typeof version === "string" && browser.releases[version]) {
    return ["beta", "nightly", "planned"].includes(
      browser.releases[version].status
    );
  }

  return false;
}

export function isFullySupportedWithoutLimitation(
  support: SimpleSupportStatement
) {
  return support.version_added && !hasLimitation(support);
}

function hasLimitation(support: SimpleSupportStatement) {
  return hasMajorLimitation(support) || support.notes;
}

function hasMajorLimitation(support: SimpleSupportStatement) {
  return (
    support.partial_implementation ||
    support.alternative_name ||
    support.flags ||
    support.prefix ||
    support.version_removed
  );
}

export function isNotSupportedAtAll(support: SimpleSupportStatement) {
  return !support.version_added && !hasLimitation(support);
}

async function fetchAllExistingDocs(pgClient): Promise<IndexedDoc[]> {
  const PAGE_SIZE = 1000;
  const selectDocs = async (lastId) => {
    const query = {
      name: "fetch-all-doc",
      text: `
        SELECT id,
            mdn_url,
            title,
            token_count,
            embedding IS NOT NULL as has_embedding,
            embedding_next IS NOT NULL as has_embedding_next,
            markdown_hash,
            text_hash
        from mdn_doc_macro
        WHERE id > $1
        ORDER BY id ASC
        LIMIT $2
      `,
      values: [lastId, PAGE_SIZE],
      rowMode: "array",
    };
    const result = await pgClient.query(query);
    return result.rows.map(
      ([
        id,
        mdn_url,
        title,
        token_count,
        has_embedding,
        has_embedding_next,
        markdown_hash,
        text_hash,
      ]) => {
        return {
          id,
          mdn_url,
          title,
          token_count,
          has_embedding,
          has_embedding_next,
          markdown_hash,
          text_hash,
        };
      }
    );
  };

  const allDocs = [];
  let docs = await selectDocs(0);
  allDocs.push(...docs);
  while (docs.length === PAGE_SIZE) {
    const lastItem = docs[docs.length - 1];
    docs = await selectDocs(lastItem.id);
    allDocs.push(...docs);
  }

  return allDocs;
}

// CLI.
program
  .command(
    "update-index",
    "Generates OpenAI embeddings for all documents and uploads them to Supabase."
  )
  .argument("<directory>", "Path in which to execute it", {
    default: path.join(BUILD_OUT_ROOT, "en-us", "docs"),
  })
  .option(
    "--use-plain-html",
    "Use `plain.html` files instead of `index.json` files."
  )
  .option(
    "--update-formatting",
    "Even if hashes match, update without generating a new embedding."
  )
  .action(function (params) {
    const { directory } = params.args as { directory: string };
    const { updateFormatting, usePlainHtml } = params.options as {
      updateFormatting: boolean;
      usePlainHtml: boolean;
    };
    return updateEmbeddings(directory, updateFormatting, usePlainHtml);
  })

  .command("format-docs", "Generates formatted docs for local debugging")
  .argument("<directory>", "Path in which to execute it", {
    default: path.join(BUILD_OUT_ROOT, "en-us", "docs"),
  })
  .option(
    "--use-plain-html",
    "Use `plain.html` files instead of `index.json` files."
  )
  .action(function (params) {
    const { directory, usePlainHtml } = params.args as {
      directory: string;
      usePlainHtml: boolean;
    };
    return formatDocs(directory, usePlainHtml);
  });

program.run();
