import { fdir } from "fdir";
import { BUILD_OUT_ROOT } from "../libs/env/index.js";
import { readFile, writeFile } from "node:fs/promises";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { renderHTML } from "../ssr/dist/main.js";
import { HydrationData } from "../libs/types/hydration.js";
import { chunks, formatDuration } from "./utils.js";

export function ssrDocument(context: HydrationData) {
  return renderHTML(context);
}

interface SSROptions {
  noDocs?: boolean;
}

export async function ssrAllDocuments({ noDocs = false }: SSROptions = {}) {
  const files = await findDocuments({ noDocs });

  const start = Date.now();

  const renderedFiles = [];
  for (const chunk of chunks(files, 1000)) {
    const out = await Promise.all(chunk.map(ssrSingleDocument).filter(Boolean));
    renderedFiles.push(...out);
  }

  const end = Date.now();

  const count = renderedFiles.length;
  const seconds = (end - start) / 1000;
  const took = formatDuration(seconds);

  console.log(
    `Rendered ${count.toLocaleString()} pages in ${took}, at a rate of ${(
      count / seconds
    ).toFixed(1)} documents per second.`
  );
}

async function findDocuments(options: Pick<SSROptions, "noDocs">) {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .exclude((dirName) => options.noDocs && dirName === "docs")
    .filter(
      (filePath) =>
        filePath.endsWith("index.json") || filePath.endsWith("404.json")
    )
    .crawl(BUILD_OUT_ROOT);
  const docs = await api.withPromise();
  return docs;
}

async function ssrSingleDocument(file: string): Promise<string> {
  const context: HydrationData = JSON.parse(await readFile(file, "utf-8"));
  if (!context?.url) {
    console.warn(
      `WARNING: Skipped rendering HTML. Document is missing url: ${file}`
    );
    return null;
  }
  const html = renderHTML(context);
  const outputFile = file.replace(/.json$/, ".html");
  await writeFile(outputFile, html);
  return outputFile;
}
