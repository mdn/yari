/**
 * This script exists only to periodically generate a
 * 'popularities.json' file from a Cloudfront access CSV export.
 *
 * Generally, only the core MDN Web Docs team needs to run this. The output
 * file gets checked into git so it's easily available to everyone.
 *
 * In production build it might be a future option to generate this
 * dynamically on every single production build.
 *
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");

const csv = require("@fast-csv/parse");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'got'.
const got = require("got");

const CURRENT_URL =
  "https://mdn-popularities-prod.s3.amazonaws.com/current.txt";

async function fetchPopularities() {
  const { body: csvURL } = await got(CURRENT_URL);
  const { body: csv } = await got(csvURL);
  return csv;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'runMakePop... Remove this comment to see the full error message
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
