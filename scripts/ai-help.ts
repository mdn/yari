import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import caporal from "@caporal/core";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { fdir } from "fdir";
import frontmatter from "front-matter";
import { Configuration, OpenAIApi } from "openai";

import { DocFrontmatter } from "../libs/types/document.js";
import {
  CONTENT_ROOT,
  OPENAI_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../libs/env/index.js";

const { program } = caporal;

const MAX_TABLE_LENGTH = 10000;
const IGNORE_SECTIONS = ["Specifications", "Browser compatibility", "See also"];

interface IndexedDoc {
  id: number;
  url: string;
  slug: string;
  title: string;
  checksum: string;
}

interface Doc {
  url: string;
  slug: string;
  title: string;
  content: string;
  checksum: string;
}

export async function updateEmbeddings(directory: string) {
  if (!OPENAI_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw Error(
      "Please set these environment variables: OPENAI_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  // Supabase.
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Open AI.
  const configuration = new Configuration({
    apiKey: OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  console.log(`Retrieving all indexed documents...`);
  const existingDocs = await fetchAllExistingDocs(supabaseClient);
  console.log(`-> Done.`);

  const existingDocByUrl = new Map<string, IndexedDoc>(
    existingDocs.map((doc) => [doc.url, doc])
  );

  console.log(`Determining changed and deleted documents...`);

  const seenUrls = new Set<string>();
  const updates: Doc[] = [];

  for await (const { url, slug, title, content } of contentDocs(directory)) {
    seenUrls.add(url);
    const checksum = createHash("sha256").update(content).digest("base64");

    // Check for existing document in DB and compare checksums.
    const existingDoc = existingDocByUrl.get(url);

    if (existingDoc?.checksum !== checksum) {
      updates.push({
        url,
        slug,
        title,
        content,
        checksum,
      });
      continue;
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

  if (updates.length > 0) {
    console.log(`Applying updates...`);
    for (const { url, slug, title, content, checksum } of updates) {
      try {
        console.log(`-> [${url}] Updating document...`);
        const existingDoc = existingDocByUrl.get(url);

        if (existingDoc) {
          await supabaseClient
            .from("mdn_doc_section")
            .delete()
            .filter("doc_id", "eq", existingDoc.id)
            .throwOnError();
        }

        // Create/update document record. Intentionally clear checksum until we
        // have successfully generated all document sections.
        const { data: doc } = await supabaseClient
          .from("mdn_doc")
          .upsert(
            {
              checksum: null,
              url,
              slug,
              title,
            },
            { onConflict: "url" }
          )
          .select()
          .single()
          .throwOnError();

        const sections = splitAndFilterSections(content);

        console.log(
          `-> [${url}] Indexing ${sections.length} document sections...`
        );

        await Promise.all(
          sections.map(async ({ heading, content }) => {
            // OpenAI recommends replacing newlines with spaces for best results (specific to embeddings)
            const input = content.replace(/\n/g, " ");

            const embeddingResponse = await openai.createEmbedding({
              model: "text-embedding-ada-002",
              input,
            });

            if (embeddingResponse.status !== 200) {
              console.error("Embedding request failed", embeddingResponse.data);
              throw new Error("Embedding request failed");
            }

            const [responseData] = embeddingResponse.data.data;

            await supabaseClient
              .from("mdn_doc_section")
              .insert({
                doc_id: doc.id,
                heading,
                content,
                token_count: embeddingResponse.data.usage.total_tokens,
                embedding: responseData.embedding,
              })
              .select()
              .single()
              .throwOnError();
          })
        );

        // Set document checksum so that we know this document was stored successfully
        await supabaseClient
          .from("mdn_doc")
          .update({ checksum })
          .filter("id", "eq", doc.id)
          .throwOnError();
      } catch (err: any) {
        console.error(
          `!> [${url}] Failed to update document. Document has been marked with null checksum to indicate that it needs to be re-generated.`
        );
        const context = err?.response?.data ?? err?.response ?? err;
        console.error(context);
      }
    }
    console.log(`-> Done.`);
  }

  if (deletions.length > 0) {
    console.log(`Applying deletions...`);
    for (const { id, url } of deletions) {
      console.log(`-> [${url}] Deleting indexed document...`);
      await supabaseClient.from("mdn_doc").delete().eq("id", id).throwOnError();
    }
    console.log(`-> Done.`);
  }
}

async function* contentPaths(directory: string) {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => filePath.endsWith("index.md"))
    .crawl(directory);

  const paths = await api.withPromise();

  for (const path of paths) {
    yield path;
  }
}

async function* contentDocs(directory: string) {
  for await (const contentPath of contentPaths(directory)) {
    const raw = await readFile(contentPath, "utf-8");
    const { attributes, body } = frontmatter<DocFrontmatter>(raw);

    const { slug, title } = attributes;

    let content = body;
    content = removeLongTables(content);
    content = removeTags(content);
    content = removeMacroCalls(content);
    content = content.trim();

    yield {
      slug,
      url: `/en-US/docs/${slug}`,
      title,
      content: `# ${title}\n\n${content}`,
    };
  }
}

function removeLongTables(str: string): string {
  return str.replace(/<table\b[^>]*>(?:.*?)<\/table>/gis, (table) =>
    table.length <= MAX_TABLE_LENGTH ? table : " "
  );
}

function removeTags(str: string): string {
  return str.replace(/<[^>]+>/g, " ");
}

function removeMacroCalls(str: string): string {
  return str.replace(/\{\{.+\}\}/g, " ");
}
function splitAndFilterSections(
  str: string
): { heading: string; content: string }[] {
  return (
    str
      .split(/(?=^## )/gm)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((section) => {
        const [firstLine, ...lines] = section.split("\n");
        const heading = firstLine.replace(/^#+ /, "");
        const content = lines.join("\n").trim();
        return { heading, content };
      })
      .filter(({ heading }) => !IGNORE_SECTIONS.includes(heading))
      // Ignore sections with few words.
      .filter(({ content }) => content.split(/\b\w+\b/g).length >= 10)
  );
}
async function fetchAllExistingDocs(supabase: SupabaseClient) {
  const PAGE_SIZE = 1000;
  const selectDocs = () =>
    supabase
      .from("mdn_doc")
      .select("id, url, slug, title, checksum")
      .order("id")
      .limit(PAGE_SIZE);

  let { data } = await selectDocs().throwOnError();
  let allData = data;
  while (data.length === PAGE_SIZE) {
    const lastItem = data[data.length - 1];
    ({ data } = await selectDocs().gt("id", lastItem.id).throwOnError());
    allData = [...allData, ...data];
  }

  return allData;
}

// CLI.
program
  .command(
    "update-index",
    "Generates OpenAI embeddings for all document sections and uploads them to Supabase."
  )
  .argument("<directory>", "Path in which to execute git", {
    default: CONTENT_ROOT,
  })
  .action(function (params) {
    const { directory } = params.args as { directory: string };
    return updateEmbeddings(directory);
  });

program.run();
