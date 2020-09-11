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

const { VALID_LOCALES } = require("../content");

function runMakePopularitiesFile(filepath, options, logger) {
  const { outfile, maxUris, locales, excludePrefixes } = options;
  const pageviews = [];
  let biggestCount = null;
  return new Promise((resolve, reject) => {
    csv
      .parseFile(filepath, {
        headers: true,
      })
      .on("error", (error) => reject(error))
      .on("data", (row) => {
        // 'let' because we might rewrite the URI to correct case.
        let uri = row.Page;
        const count = parseInt(row.Pageviews);

        if (
          uri.includes("/docs/") &&
          !uri.includes("$") &&
          !uri.includes("?")
        ) {
          try {
            const locale = uri.split("/docs/")[0].split("/")[1];
            const localeLC = locale.toLowerCase();
            // The Google Analytics pageviews often contain URIs with the
            // locale in the wrong case. E.g. `/en-us/docs/Foo`.
            // We need to tidy these up to come `/en-US/docs/Foo`

            // First filter out complete junk locales
            if (!VALID_LOCALES.has(localeLC)) {
              return;
            }
            if (locale !== VALID_LOCALES.get(localeLC)) {
              uri = uri.replace(locale, VALID_LOCALES.get(localeLC));
            }
            if (locales.length && !locales.includes(localeLC)) {
              return;
            }
          } catch (err) {
            logger.warn(chalk.yellow(`Bad URI ${uri}`));
            return;
          }

          // Yeah, this is slow and inefficient but it doesn't have to be fast.
          for (const excludePrefix of excludePrefixes) {
            if (uri.includes(`/docs/${excludePrefix}`)) {
              return;
            }
          }

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
          chalk.green(
            `Wrote ${numberKeys.toLocaleString()} pages' popularities.`
          )
        );
        logger.info(
          chalk.green(`${outfile} is ${fmtBytes(fs.statSync(outfile).size)}`)
        );

        resolve(outfile);
      });
  });
}

function fmtBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

module.exports = runMakePopularitiesFile;
