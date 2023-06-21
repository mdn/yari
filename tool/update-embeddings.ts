import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { fdir } from "fdir";
import frontmatter from "front-matter";
import { Configuration, OpenAIApi } from "openai";
import { createClient } from "@supabase/supabase-js";

import { DocFrontmatter } from "../libs/types/document.js";
import {
  OPENAI_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../libs/env/index.js";

const IGNORE_SECTIONS = ["Specifications", "Browser compatibility", "See also"];

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

  for await (const { slug, title, content } of contentDocs(directory)) {
    try {
      const checksum = createHash("sha256").update(content).digest("base64");

      // Check for existing document in DB and compare checksums.
      const { data: existingDoc } = await supabaseClient
        .from("mdn_doc")
        .select("id, slug, title, checksum")
        .filter("slug", "eq", slug)
        .maybeSingle()
        .throwOnError();

      if (existingDoc?.checksum === checksum) {
        console.log(`[${slug}] No change.`);
        continue;
      }

      if (existingDoc) {
        console.log(
          `[${slug}] Changes detected, removing old sections (and their embeddings).`
        );

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
            slug,
            title,
          },
          { onConflict: "slug" }
        )
        .select()
        .single()
        .throwOnError();

      const sections = splitAndFilterSections(content);

      console.log(
        `[${slug}] Adding ${sections.length} document sections (with embeddings)`
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
              doc_id: doc!.id,
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
        .filter("id", "eq", doc!.id)
        .throwOnError();
    } catch (err) {
      console.error(
        `Document '${slug}' or one/multiple of its document sections failed to store properly. Document has been marked with null checksum to indicate that it needs to be re-generated.`
      );
      console.error(err);
    }
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

    // Use slug as id.
    const { slug, title } = attributes;

    let content = body;
    content = removeTags(content);
    content = removeMacroCalls(content);
    content = content.trim();

    yield { slug, title, content: `# ${title}\n\n${content}` };
  }
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
