import { readFileSync, writeFileSync } from "node:fs";

async function main() {
  const [refPath, inputPath, outputPath = null] = process.argv.slice(2);

  const readJson = (path) => JSON.parse(readFileSync(path, "utf-8"));
  const slugify = (url) => url.replace(/^\/[^/]+\/docs\//, "");

  // Read reference (e.g. "client/build/en-us/search-index.json")
  // into map: slug -> index-in-ref
  const ref = Object.fromEntries(
    readJson(refPath).map(({ url }, i) => [slugify(url), i])
  );

  // Read index (e.g. "client/build/de/search-index.json").
  const input = readJson(inputPath);

  // Array of tuples (index-in-ref, input-entry).
  const indexed = input.map(({ title, url }) => [
    ref[slugify(url)] ?? Infinity,
    { title, url },
  ]);
  // Sort by index-in-ref.
  indexed.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const result = indexed.map(([, entry]) => entry);

  writeFileSync(outputPath ?? inputPath, JSON.stringify(result), "utf-8");
}

try {
  main();
} catch (e) {
  console.error(e);
  if (process.env.GITHUB_ACTIONS) {
    console.log(`::error::${e.toString()} `);
  }
}
