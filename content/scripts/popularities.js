/**
 * This script exists only to periodically generate a
 * 'content/popularities.json' file from a Google Analytics pageviews CSV
 * export.
 * Generally, only the core MDN Web Docs team needs to run this. The output
 * file gets checked into git so it's easily available to everyone.
 *
 * In production build it might be a future option to generate this
 * dynamically on every single production build.
 *
 */
const fs = require("fs");

const chalk = require("chalk");
const csv = require("@fast-csv/parse");

function runMakePopularitiesFile(filepath, options, logger) {
  const { outfile, maxUris } = options;
  const pageviews = [];
  let biggestCount = null;
  csv
    .parseFile(filepath, {
      headers: true
    })
    .on("error", error => console.error(error))
    .on("data", row => {
      const uri = row.Page;
      const count = parseInt(row.Pageviews);

      if (uri.includes("/docs/") && !uri.includes("$") && !uri.includes("?")) {
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
    .on("end", rowCount => {
      logger.info(chalk.green(`Parsed ${rowCount.toLocaleString()} rows.`));
      if (!pageviews.length) {
        new Error("No pageviews found!");
      }
      const popularities = {};
      pageviews.slice(0, maxUris).forEach(([uri, popularity]) => {
        popularities[uri] = popularity;
      });
      fs.writeFileSync(outfile, JSON.stringify(popularities, null, 2));
      const numberKeys = Object.keys(popularities).length;
      logger.info(
        chalk.green(`Wrote ${numberKeys.toLocaleString()} pages' popularities.`)
      );
      logger.info(
        chalk.green(`${outfile} is ${fmtBytes(fs.statSync(outfile).size)}`)
      );

      logger.info(
        chalk.yellow("You probably want to delete content/_all-titles.json now")
      );

      logger.debug("25 most popular URIs...");
      pageviews.slice(0, 25).forEach(([uri, popularity], i) => {
        logger.debug(
          `${(i + "").padEnd(2)} ${uri.padEnd(75)} ${popularity.toFixed(5)}`
        );
      });
    });
}

function fmtBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

module.exports = { runMakePopularitiesFile };
