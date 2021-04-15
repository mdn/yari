/**
 * This script exists only to periodically generate a
 * 'content/popularities.json' file from a Cloudfront access CSV export.
 *
 * Generally, only the core MDN Web Docs team needs to run this. The output
 * file gets checked into git so it's easily available to everyone.
 *
 * In production build it might be a future option to generate this
 * dynamically on every single production build.
 *
 */
const fs = require("fs");

const csv = require("@fast-csv/parse");
const got = require("got");

const CURRENT_URL =
  "https://mdn-popularities-prod.s3.amazonaws.com/current.txt";

async function fetchPopularities() {
  let { body: csvURL } = await got(CURRENT_URL);
  let { body: csv } = await got(csvURL);
  return csv;
}

async function runMakePopularitiesFile(options) {
  const { outfile, maxUris } = options;
  const pageviews = [];
  let biggestCount = null;
  const raw = await fetchPopularities();
  return new Promise((resolve, reject) => {
    csv
      .parseString(raw, {
        headers: true,
      })
      .on("error", (error) => console.error(error))
      .on("data", (row) => {
        const uri = row.Page;
        const count = parseInt(row.Pageviews);

        if (
          uri.includes("/docs/") &&
          !uri.includes("$") &&
          !uri.includes("?")
        ) {
          if (biggestCount === null) {
            // First row!
            biggestCount = count;
          }
          // The pageviews CSV file is always sorted by biggest to last.
          // And the floating point number we record as the URI's "popularity"
          // just needs to be relative.
          // By computing it as a ratio between the biggest you get decent
          // looking floating point numbers that aren't affected by the
          // date range in the CSV export.
          pageviews.push([uri, count / biggestCount]);
        }
      })
      .on("end", (rowCount) => {
        if (!pageviews.length) {
          return reject(new Error("No pageviews found!"));
        }
        const popularities = {};
        pageviews.slice(0, maxUris).forEach(([uri, popularity]) => {
          popularities[uri] = parseFloat(popularity.toFixed(5));
        });
        fs.writeFileSync(outfile, JSON.stringify(popularities, null, 2));
        resolve({ rowCount, popularities, pageviews });
      });
  });
}

module.exports = { runMakePopularitiesFile };
