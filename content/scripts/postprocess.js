const assert = require("assert").strict;
const fs = require("fs");
const path = require("path");

const ms = require("ms");
const httpServer = require("http-server");
const chalk = require("chalk");
const cheerio = require("./monkeypatched-cheerio");
const minimalcss = require("minimalcss");
const puppeteer = require("puppeteer");

const HTTP_SERVER_PORT = 8888;

const buildRoot = path.join("client", "build");

/** Note!
 * You're going to get
 *
 *   [DEP0066] DeprecationWarning: OutgoingMessage.prototype._headers is deprecated
 *
 * when using Node >=12
 * See https://github.com/http-party/http-server/issues/537
 */

function msLong(milliseconds) {
  return ms(milliseconds, { long: true });
}

async function inlineCSSPostProcess(tasks, { root = buildRoot } = {}) {
  const browser = await puppeteer.launch();
  const server = httpServer.createServer({ root });
  server.listen(HTTP_SERVER_PORT);

  const totalTimes = [];
  let skipped = 0;
  let failed = 0;

  const T0 = new Date();
  try {
    await Promise.all(
      tasks.map(async ({ uri, filepath }) => {
        assert(uri.startsWith("/"));

        const originalHtml = fs.readFileSync(path.resolve(filepath));
        if (originalHtml.includes(`onload="this.media='all'"`)) {
          console.warn("HTML has already been post processed", uri, filepath);
          skipped++;
          return;
        }
        let result;
        const url = `http://0.0.0.0:${HTTP_SERVER_PORT}${uri}`;
        const t0 = new Date();
        try {
          result = await minimalcss.minimize({
            urls: [url],
            skippable: (request) => {
              return new URL(request.url()).host !== new URL(url).host;
            },
          });
        } catch (err) {
          console.log(`Problem running minimize on ${uri} (${filepath})`);
          console.log(chalk.yellow.bold(err));
          failed++;
          return;
        }
        const stylesheetsFound = Object.keys(result.stylesheetContents).map(
          (u) => new URL(u).pathname
        );
        const $ = cheerio.load(originalHtml);
        $('link[rel="stylesheet"]').each((_, element) => {
          const $element = $(element);
          if (
            !$element.attr("media") &&
            stylesheetsFound.includes($element.attr("href"))
          ) {
            $element.attr("media", "print");
            $element.attr("onload", "this.media='all'");
          }
        });
        $("head").append($("<style>").text(result.finalCss));
        let finalHtml = $.html();
        // Hack around cheerio
        finalHtml = finalHtml.replace(
          /onload="this.media=&apos;all&apos;"/g,
          `onload="this.media='all'"`
        );
        fs.writeFileSync(filepath, finalHtml);
        const t1 = new Date();
        console.log(`Took ${msLong(t1 - t0)} to inline CSS on ${uri}`);
        // console.log({ uri, filepath });
        totalTimes.push(t1 - t0);
      })
    );
    const T1 = new Date();

    if (skipped || failed) {
      console.log(chalk.yellow(`${skipped} skipped and ${failed}.`));
    }
    if (totalTimes.length) {
      // const totalTime = totalTimes.reduce((a, b) => a + b, 0);
      const totalTime = T1 - T0;
      console.log(
        chalk.bold.green(
          `Processed ${totalTimes.length} files in ${msLong(totalTime)}.`
        )
      );
      console.log(
        chalk.green(
          `Average rate of ${((1000 * totalTimes.length) / totalTime).toFixed(
            1
          )} files/sec.`
        )
      );
      // console.log(totalTimes);
      // console.log(minimizeTimes);
    } else {
      console.log(chalk.yellow("0 files processed."));
    }
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    await browser.close();
    server.close();
  }
}
function getMostPopularBuilds({
  locales = ["en-us"],
  buildRoot,
  maxFiles = 100,
} = {}) {
  const mostPopular = [];
  for (const locale of locales) {
    const localeFolder = path.join(buildRoot, locale);
    for (const [folder, files] of walker(localeFolder)) {
      if (files.includes("index.html") && files.includes("index.json")) {
        const { doc } = JSON.parse(
          fs.readFileSync(path.join(folder, "index.json"))
        );
        mostPopular.push({
          popularity: doc.popularity,
          uri: doc.mdn_url,
          filepath: path.join(folder, "index.html"),
        });
      }
    }
  }
  mostPopular.sort((a, b) => b.popularity - a.popularity);

  return mostPopular.slice(0, maxFiles);
}

function* walker(root, depth = 0) {
  const files = fs.readdirSync(root);
  if (!depth) {
    yield [
      root,
      files.filter((name) => {
        return !fs.statSync(path.join(root, name)).isDirectory();
      }),
    ];
  }
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield [
        filepath,
        fs.readdirSync(filepath).filter((name) => {
          return !fs.statSync(path.join(filepath, name)).isDirectory();
        }),
      ];
      yield* walker(filepath, depth + 1);
    }
  }
}
module.exports = {
  inlineCSSPostProcess,
  getMostPopularBuilds,
};
