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
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import type { ActionParameters, Logger, Program } from "@caporal/core";
import * as csv from "@fast-csv/parse";
import chalk from "chalk";
import got from "got";

import { tryOrExit } from "../util.js";

const CURRENT_URL =
  "https://mdn-popularities-prod.s3.amazonaws.com/current.txt";

// The Google Analytics pageviews CSV file parsed, sorted (most pageviews
// first), and sliced to this number of URIs that goes into the JSON file.
// If this number is too large the resulting JSON file gets too big and
// will include very rarely used URIs.
const MAX_GOOGLE_ANALYTICS_URIS = 20000;

interface PopularitiesActionParameters extends ActionParameters {
  options: {
    outfile: string;
    maxUris: number;
    refresh: boolean;
  };
  logger: Logger;
}

export function popularitiesCommand(program: Program) {
  return program
    .command(
      "popularities",
      "Convert an AWS Athena log aggregation CSV into a popularities.json file"
    )
    .option("--outfile <path>", "output file", {
      default: fileURLToPath(
        new URL("../../popularities.json", import.meta.url)
      ),
    })
    .option("--max-uris <number>", "limit to top <number> entries", {
      default: MAX_GOOGLE_ANALYTICS_URIS,
    })
    .option("--refresh", "download again even if exists", {
      default: false,
    })
    .action(
      tryOrExit(async ({ options, logger }: PopularitiesActionParameters) => {
        const { refresh, outfile } = options;
        if (!refresh && fs.existsSync(outfile)) {
          const stat = fs.statSync(outfile);
          logger.info(
            chalk.yellow(
              `Reusing exising ${outfile} (${stat.mtime}) for popularities.`
            )
          );
          logger.info(
            `Reset ${outfile} by running: yarn tool popularities --refresh`
          );
          return;
        }
        const { rowCount, popularities, pageviews } =
          await runMakePopularitiesFile(options);
        logger.info(chalk.green(`Parsed ${rowCount.toLocaleString()} rows.`));

        const numberKeys = Object.keys(popularities).length;
        logger.info(
          chalk.green(
            `Wrote ${numberKeys.toLocaleString()} pages' popularities.`
          )
        );

        logger.debug("25 most popular URIs...");
        pageviews.slice(0, 25).forEach(([uri, popularity], i) => {
          logger.debug(
            `${`${i}`.padEnd(2)} ${uri.padEnd(75)} ${popularity.toFixed(5)}`
          );
        });
        function fmtBytes(bytes) {
          return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
        }
        logger.info(
          chalk.green(
            `${options.outfile} is ${fmtBytes(
              fs.statSync(options.outfile).size
            )}`
          )
        );
      })
    );
}

async function fetchPopularities() {
  const { body: csvURL } = await got(CURRENT_URL);
  const { body: csv } = await got(csvURL);
  return csv;
}

interface PopularitiesResult {
  rowCount: number;
  popularities: { [uri: string]: number };
  pageviews: [string, number][];
}

async function runMakePopularitiesFile({
  outfile,
  maxUris,
}: {
  outfile: string;
  maxUris: number;
}): Promise<PopularitiesResult> {
  const pageviews: [string, number][] = [];
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
      .on("end", (rowCount: number) => {
        if (!pageviews.length) {
          return reject(new Error("No pageviews found!"));
        }
        const popularities: { [uri: string]: number } = {};
        pageviews.slice(0, maxUris).forEach(([uri, popularity]) => {
          popularities[uri] = parseFloat(popularity.toFixed(5));
        });
        fs.writeFileSync(outfile, JSON.stringify(popularities, null, 2));
        resolve({ rowCount, popularities, pageviews });
      });
  });
}
