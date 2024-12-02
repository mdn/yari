import { readFileSync, writeFileSync } from "node:fs";

async function main() {
  const [refPath, inputPath, outputPath = null] = process.argv.slice(2);

  const readJson = (path) => JSON.parse(readFileSync(path, "utf-8"));
  const getSlug = ({ url }) => url.replace(/^\/[^/]+\/docs\//, "");

  // Read reference (e.g. "client/build/en-us/search-index.json").
  const ref = readJson(refPath).map(getSlug);

  // Read index (e.g. "client/build/de/search-index.json").
  const input = readJson(inputPath);

  const getIndex = (slug) => ref.indexOf(slug);

  const result = [];
  for (const [fromIndex, toIndex] of input
    .map(getSlug)
    .map(getIndex)
    .entries()) {
    result[toIndex] = input[fromIndex];
  }

  writeFileSync(outputPath ?? inputPath, JSON.stringify(result), "utf-8");
}

main();
