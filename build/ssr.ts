import { fdir } from "fdir";
import { BUILD_OUT_ROOT } from "../libs/env/index.js";
import { readFile, writeFile } from "node:fs/promises";
import { renderHTML } from "../ssr/dist/main.js";
import { HydrationData } from "../libs/types/hydration.js";

export async function ssrAllDocuments() {
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter(
      (filePath) =>
        filePath.endsWith("index.json") || filePath.endsWith("404.json")
    )
    .crawl(BUILD_OUT_ROOT);
  const docs = await api.withPromise();

  const t0 = new Date();
  const out = await Promise.all(
    docs
      .map(async (file) => {
        const context: HydrationData = JSON.parse(
          await readFile(file, "utf-8")
        );
        if (!context?.url) {
          return null;
        }
        const html = renderHTML(context);
        const outputFile = file.replace(/.json$/, ".html");
        await writeFile(outputFile, html);
        return outputFile;
      })
      .filter(Boolean)
  );
  const t1 = new Date();
  const count = out.length;
  const seconds = (t1.getTime() - t0.getTime()) / 1000;
  const took =
    seconds > 60
      ? `${(seconds / 60).toFixed(1)} minutes`
      : `${seconds.toFixed(1)} seconds`;
  console.log(
    `Rendered ${count.toLocaleString()} pages in ${took}, at a rate of ${(
      count / seconds
    ).toFixed(1)} documents per second.`
  );
}
