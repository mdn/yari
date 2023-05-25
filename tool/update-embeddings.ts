import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { fdir } from "fdir";
import frontmatter from "front-matter";
import { Configuration, OpenAIApi } from "openai";

import { DocFrontmatter } from "../libs/types/document.js";
import { DEFAULT_LOCALE } from "../libs/constants/index.js";
import { OPENAI_KEY } from "../libs/env/index.js";

const IGNORE_SECTIONS = ["Specifications", "Browser compatibility", "See also"];

export async function updateEmbeddings(directory: string) {
  const configuration = new Configuration({
    apiKey: OPENAI_KEY,
  });
  const openai = new OpenAIApi(configuration);

  for await (const { slug, locale, content } of contentDocs(directory)) {
    const checksum = createHash("sha256").update(content).digest("base64");

    // TODO Skip if checksum has not changed.

    const sections = content
      .split(/(?=^## )/gm)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`[${locale}] ${slug} has >> ${sections.length} << sections!`);

    for (const section of sections) {
      const [firstLine, ...lines] = section.split("\n");
      const heading = firstLine.replace(/^#+ /, "");
      const content = lines.join("\n").trim();

      if (IGNORE_SECTIONS.includes(heading)) {
        // Ignore.
        continue;
      }
      const wordCount = content.split(/\b\w+\b/g).length;
      if (wordCount < 10) {
        // Ignore very short sections.
        continue;
      }

      if (!OPENAI_KEY) {
        continue;
      }

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

      const {
        embedding,
        data: {
          usage: { total_tokens },
        },
      } = responseData;

      // TODO Store in database.
      console.log({ slug, heading, content });
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
  for await (const path of contentPaths(directory)) {
    const raw = await readFile(path, "utf-8");
    const { attributes, body } = frontmatter<DocFrontmatter>(raw);

    // Use slug as id.
    const { slug, title } = attributes;

    const locale = DEFAULT_LOCALE;

    let content = body;
    content = removeTags(content);
    content = removeMacroCalls(content);
    content = content.trim();

    yield { locale, slug, content: `# ${title}\n\n${content}` };
  }
}

function removeTags(str: string): string {
  return str.replace(/<[^>]+>/g, " ");
}

function removeMacroCalls(str: string): string {
  return str.replace(/\{\{.+\}\}/g, " ");
}
