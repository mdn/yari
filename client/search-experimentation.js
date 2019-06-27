/**
 * The purpose of this file is for you to edit and test different things.
 * You don't have to check in your changes if you don't want to.
 * Play with different options for creating your index and play with
 * different ways to make the query.
 */
const fs = require("fs");
const FlexSearch = require("flexsearch");
const data = fs.readFileSync("public/titles.json", "utf8");
const titles = JSON.parse(data);

const index = new FlexSearch({
  encode: "advanced",
  tokenize: "reverse",
  suggest: true
});

const _map = {};
Object.entries(titles).forEach(([uri, title]) => {
  _map[uri] = title;
  index.add(uri, title);
});

const q = "vi";
const indexResults = index.search(q, 10);
const results = indexResults.map(uri => {
  return { uri, title: _map[uri] };
});
console.log(JSON.stringify(results, null, 2));
