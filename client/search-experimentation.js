/**
 * The purpose of this file is for you to edit and test different things.
 * You don't have to check in your changes if you don't want to.
 * Play with different options for creating your index and play with
 * different ways to make the query.
 */
const fs = require("fs");
const path = require("path");
const FlexSearch = require("flexsearch");

// Run: `node content build -l en-us && ls -l client/build/en-us/titles.json`
const titles = JSON.parse(
  fs.readFileSync(path.resolve("client/build/en-us/titles.json"))
).titles;

const index = new FlexSearch({
  suggest: true,
  // tokenize: "reverse",
  tokenize: "forward",
});

let countIndexed = 0;
Object.entries(titles)
  .sort((a, b) => b[1].popularity - a[1].popularity)
  .forEach(([uri, info], i) => {
    // XXX investigate if it's faster to add all at once
    // https://github.com/nextapps-de/flexsearch/#addupdateremove-documents-tofrom-the-index
    index.add(uri, info.title);
    countIndexed++;
  });
console.log(`Index ${countIndexed.toLocaleString()} URIs`);

const q = process.argv[2];
if (!q) {
  throw new Error(`Run: node ${__filename} mysearchstring`);
}
console.log({ q });
const indexResults = index.search(q, 5);
const results = indexResults.map((uri) => {
  return { uri, title: titles[uri] };
});
console.log(JSON.stringify(results, null, 2));
