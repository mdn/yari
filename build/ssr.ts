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

export async function ssrAllDocuments(noDocs = false) {
  const docs = await findDocuments(noDocs);

  const t0 = new Date();

  const done = [];
  for (const chunk of chunks(docs, 1000)) {
    const out = await Promise.all(chunk.map(ssrSingleDocument).filter(Boolean));
    done.push(...out);
  }
  const t1 = new Date();
  const count = done.length;
  const seconds = (t1.getTime() - t0.getTime()) / 1000;
  const took = formatDuration(seconds);

  console.log(
    `Rendered ${count.toLocaleString()} pages in ${took}, at a rate of ${(
      count / seconds
    ).toFixed(1)} documents per second.`
  );
}

async function findDocuments(noDocs: boolean) {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .exclude((dirName) => noDocs && dirName === "docs")
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
    return null;
  }
  const html = renderHTML(context);
  const outputFile = file.replace(/.json$/, ".html");
  await writeFile(outputFile, html);
  return outputFile;
}
