import { readFileSync, writeFileSync } from "node:fs";

async function main() {
  const [refPath, inputPath, outputPath = null] = process.argv.slice(2);

  const readJson = (path) => JSON.parse(readFileSync(path, "utf-8"));
  const getSlug = ({ url }) => url.replace(/^\/[^/]+\/docs\//, "");

  // Read reference (e.g. "client/build/en-us/search-index.json").
  const ref = readJson(refPath);
  const refSlugs = ref.map(getSlug);

  // Read index (e.g. "client/build/de/search-index.json").
  const input = readJson(inputPath);
  const inputSlugs = input.map(getSlug);

  const result = [];

  // Add entry for each reference item.
  for (const [refIndex, slug] of refSlugs.entries()) {
    const inputIndex = inputSlugs.indexOf(slug);
    // Use reference item if it's currently missing in index.
    const item = inputIndex !== -1 ? input[inputIndex] : ref[refIndex];
    result.push(item);
  }

  // Add entry for any item that is NOT in the reference (e.g. moved/removed).
  for (const [inputIndex, slug] of inputSlugs.entries()) {
    if (!refSlugs.includes(slug)) {
      const item = input[inputIndex];
      result.push(item);
    }
  }

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
