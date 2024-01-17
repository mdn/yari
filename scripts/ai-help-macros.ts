import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import caporal from "@caporal/core";
import pg from "pg";
import pgvector from "pgvector/pg";
import { fdir } from "fdir";
import OpenAI from "openai";
import { load as cheerio } from "cheerio";

import { DocMetadata } from "../libs/types/document.js";
import {
  BUILD_OUT_ROOT,
  OPENAI_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../libs/env/index.js";
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

const { program } = caporal;

interface IndexedDoc {
  id: number;
  mdn_url: string;
  title: string;
  token_count: number | null;
  hash: string;
  text_hash: string;
}

interface Doc {
  mdn_url: string;
  title: string;
  hash: string;
  html: string;
  text?: string;
  text_hash?: string;
}

export async function updateEmbeddings(
  directory: string,
  updateFormatting: boolean
) {
  if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw Error(
      "Please set these environment variables: OPENAI_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  // Supabase.
  const pgClient = new pg.Client({
    port: 5432,
    database: "postgres",
  });

  await pgClient.connect();
  await pgClient.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pgvector.registerType(pgClient);

  // Open AI.
  const openai = new OpenAI({
    apiKey: OPENAI_KEY,
  });

  const createEmbedding = async (input: string) => {
    let embeddingResponse: OpenAI.Embeddings.CreateEmbeddingResponse;
    try {
      embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input,
      });
    } catch (e: any) {
      const {
        error: { message, type },
        status,
      } = e.response;
      console.error(
        `[!] Failed to create embedding (${status}): ${type} - ${message}`
      );
      // Try again with trimmed content.
      embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
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
  const formattingUpdates: Doc[] = [];

  for await (const { mdn_url, title, hash, html, text } of builtDocs(
    directory
  )) {
    seenUrls.add(mdn_url);

    // Check for existing document in DB and compare checksums.
    const existingDoc = existingDocByUrl.get(mdn_url);

    const text_hash = createHash("sha256").update(text).digest("base64");

    if (existingDoc?.text_hash !== text_hash) {
      updates.push({
        mdn_url,
        title,
        hash,
        html,
        text,
        text_hash,
      });
    } else if (updateFormatting || existingDoc?.hash !== hash) {
      formattingUpdates.push({
        mdn_url,
        title,
        hash,
        html,
      });
    }
  }

  console.log(
    `-> ${updates.length} of ${seenUrls.size} documents were changed (or added).`
  );
  const deletions: IndexedDoc[] = [...existingDocByUrl.entries()]
    .filter(([key]) => !seenUrls.has(key))
    .map(([, value]) => value);
  console.log(
    `-> ${deletions.length} of ${existingDocs.length} indexed documents were deleted (or moved).`
  );

  if (updates.length > 0 || formattingUpdates.length > 0) {
    console.log(`Applying updates...`);
    for (const { mdn_url, title, hash, html, text, text_hash } of updates) {
      try {
        console.log(`-> [${mdn_url}] Updating document...`);

        // Embedding for full document.
        const { total_tokens, embedding } = await createEmbedding(text);

        // Create/update document record.
        const query = {
          name: "upsert-embedding-doc",
          text: `
            INSERT INTO mdn_doc_macro(
                    mdn_url,
                    title,
                    hash,
                    html,
                    token_count,
                    embedding,
                    text_hash
                )
            VALUES($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (mdn_url) DO
            UPDATE
            SET mdn_url = $1,
                title = $2,
                hash = $3,
                html = $4,
                token_count = $5,
                embedding = $6,
                text_hash = $7
          `,
          values: [
            mdn_url,
            title,
            hash,
            html,
            total_tokens,
            pgvector.toSql(embedding),
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
    for (const { mdn_url, title, hash, html } of formattingUpdates) {
      try {
        console.log(
          `-> [${mdn_url}] Updating document without generating new embedding...`
        );

        // Create/update document record.
        const query = {
          name: "upsert-doc",
          text: `
            INSERT INTO mdn_doc_macro(mdn_url, title, hash, html)
            VALUES($1, $2, $3, $4) ON CONFLICT (mdn_url) DO
            UPDATE
            SET mdn_url = $1,
                title = $2,
                hash = $3,
                html = $4
          `,
          values: [mdn_url, title, hash, html],
          rowMode: "array",
        };

        await pgClient.query(query);
      } catch (err: any) {
        console.error(`!> [${mdn_url}] Failed to update document.`);
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

async function formatDocs(directory: string) {
  for await (const { html, text } of builtDocs(directory)) {
    console.log(html, text);
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

async function* builtDocs(directory: string) {
  for await (const metadataPath of builtPaths(directory)) {
    try {
      const raw = await readFile(metadataPath, "utf-8");
      const { title, mdn_url, hash } = JSON.parse(raw) as DocMetadata;

      const plainPath = path.join(path.dirname(metadataPath), "plain.html");
      const plainHTML = await readFile(plainPath, "utf-8");

      // reformat HTML version, used as context
      const $ = cheerio(plainHTML);
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

      // reformat text version, used for embedding
      $("title").remove();
      $("#browser_compatibility, .bc-table").remove();
      const text = $.text().trim().replace(/\n+/g, "\n");

      yield {
        mdn_url,
        title,
        hash,
        html,
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

async function fetchAllExistingDocs(pgClient) {
  const PAGE_SIZE = 1000;
  const selectDocs = async (lastId) => {
    const query = {
      name: "fetch-all-doc",
      text: `
        SELECT id,
            mdn_url,
            title,
            hash,
            token_count,
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
      ([id, mdn_url, title, hash, token_count, text_hash]) => {
        return { id, mdn_url, title, hash, token_count, text_hash };
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
    "--update-formatting",
    "Even if hashes match, update without generating a new embedding."
  )
  .action(function (params) {
    const { directory } = params.args as { directory: string };
    const { updateFormatting } = params.options as {
      updateFormatting: boolean;
    };
    return updateEmbeddings(directory, updateFormatting);
  })
  .command("format-docs", "Generates formatted docs for local debugging")
  .argument("<directory>", "Path in which to execute it", {
    default: path.join(BUILD_OUT_ROOT, "en-us", "docs"),
  })
  .action(function (params) {
    const { directory } = params.args as { directory: string };
    return formatDocs(directory);
  });

program.run();
