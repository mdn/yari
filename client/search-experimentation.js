/**
 * The purpose of this file is for you to edit and test different things.
 * You don't have to check in your changes if you don't want to.
 * Play with different options for creating your index and play with
 * different ways to make the query.
 */
const fs = require("fs");
const FlexSearch = require("flexsearch");
const data = fs.readFileSync("build/titles.json", "utf8");
const titles = JSON.parse(data).titles;

const index = new FlexSearch({
  encode: "advanced",
  tokenize: "forward",
  suggest: true
});

const _map = titles;
Object.entries(titles).forEach(([uri, title]) => {
  (title === "CSS" || title.startsWith("CSP")) && console.log({ uri, title });
  index.add(uri, title);
});

const q = "CSS";
const indexResults = index.search(q, {
  limit: 5,
  suggest: true
});
const results = indexResults.map(uri => {
  return { uri, title: _map[uri] };
});
console.log(JSON.stringify(results, null, 2));
