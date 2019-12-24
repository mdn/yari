const url = require("url");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const cheerio = require("cheerio");
const yaml = require("js-yaml");

require("dotenv").config();

const ProgressBar = require("ssr/progress-bar");

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_ROOT = process.env.ROOT || path.join(__dirname, "..", "files");

const REDIRECT_HTML = "REDIRECT <a ";

function runImporter(options) {
  const creds = url.parse(options.dbURL);
  const host = creds.host; // XXX should it be creds.hostname??
  const user = (creds.auth && creds.auth.split(":")[0]) || "";
  const password = (creds.auth && creds.auth.split(":")[1]) || "";
  const database = creds.pathname.split("/")[1];

  console.log(
    `Going to try to connect to ${database} (locales=${options.locales})`
  );

  const connection = mysql.createConnection({
    host,
    user,
    password,
    database
  });
  connection.connect();

  const importer = new ToDiskImporter(connection, options, () => {
    connection.end();
  });
  importer.start();
}

/** The basic class that takes a connection and options, and a callback to
 * be called when all rows have been processed.
 * The only API function is the `start` method. Example:
 *
 *     const options = { locales: ['en-US'] }
 *     const importer = new Importer(someDbConnection, options, () => {
 *        someDbConnection.close();
 *     })
 *     importer.start();
 *
 * The most important methods to override are:
 *
 *     - processRow()
 *     -   or, processRedirect()
 *     -   or, processDocument()
 *     - end()
 *
 */
class Importer {
  constructor(connection, options, quitCallback) {
    this.connection = connection;
    this.options = options;
    this.quitCallback = quitCallback;

    this.progressBar = !options.noProgressbar
      ? new ProgressBar({
          includeMemory: true
        })
      : null;
    // Massive mutable for all directs
    this.allRedirects = {};
  }
  initProgressbar(total) {
    this.progressBar && this.progressBar.init(total);
  }
  tickProgressbar(incr) {
    this.progressBar && this.progressBar.update(incr);
  }
  stopProgressbar() {
    this.progressBar && this.progressBar.stop();
  }

  start() {
    const { locales } = this.options;

    // Count of how many rows we've processed
    let individualCount = 0;
    let totalCount = 0; // this'll soon be set by the first query

    this.startTime = Date.now();

    // Let's warm up by seeing we can connect to the wiki_document table
    // and extract some stats.
    let sql = `
      SELECT locale, COUNT(*) as count from wiki_document
      `;
    let queryArgs = [];
    if (locales && locales.length) {
      sql += `WHERE locale in (?)`;
      queryArgs.push(locales);
    }
    sql += "group by locale ORDER by count DESC ";

    // First make a table of locale<->counts
    this.connection.query(sql, queryArgs, (error, results) => {
      if (error) throw error;

      console.log(`LOCALE\tDOCUMENTS`);
      let countNonEnUs = 0;
      let countEnUs = 0;
      results.forEach(result => {
        console.log(`${result.locale}\t${result.count.toLocaleString()}`);
        totalCount += result.count;
        if (result.locale === "en-US") {
          countEnUs += result.count;
        } else {
          countNonEnUs += result.count;
        }
      });
      if (countNonEnUs && countEnUs) {
        const nonEnUsPercentage =
          (100 * countNonEnUs) / (countNonEnUs + countEnUs);
        console.log(
          `(FYI ${countNonEnUs.toLocaleString()} (${nonEnUsPercentage.toFixed(
            1
          )}%) are non-en-US)`
        );
      }
      this.initProgressbar(totalCount);

      // Actually do the imported
      sql = `SELECT * FROM wiki_document`;
      if (locales && locales.length) {
        sql += ` WHERE locale in (?)`;
      }
      const query = this.connection.query(sql, queryArgs);
      query
        .on("error", err => {
          // Handle error, an 'end' event will be emitted after this as well
          console.error("Error event!");
          throw err;
        })
        // .on("fields", function(fields) {
        //   // the field packets for the rows to follow
        //   // console.log("FIELDS:", fields);
        // })
        .on("result", row => {
          individualCount++;
          // Only update (and repaint) every 20th time.
          // Make it much more than every 1 time or else it'll flicker.
          individualCount % 20 == 0 && this.tickProgressbar(individualCount);

          this.processRow(row, () => {});
          // // Pausing the connnection is useful if your processing involves I/O
          // connection.pause();

          // processRow(row, function() {
          //   connection.resume();
          // });
        })
        .on("end", () => {
          this.end(individualCount);
        });
    });
  }
  processRow(row, resumeCallback) {
    const absoluteUrl = `/${row.locale}/docs/${row.slug}`;
    if (row.is_redirect) {
      this.processRedirect(row, absoluteUrl);
    } else {
      this.processDocument(row, absoluteUrl);
    }
    resumeCallback();
  }

  processRedirect(doc, absoluteUrl) {
    if (doc.html.includes(REDIRECT_HTML)) {
      const redirectUrl = this.getRedirectURL(doc.html);
      if (redirectUrl) {
        // if (redirectUrl.includes("://")) {
        //   console.warn(
        //     "WEIRD REDIRECT:",
        //     redirectUrl,
        //     "  FROM  ",
        //     `https://developer.mozilla.org${encodeURI(absoluteUrl)}`
        //   );
        // }
        this.allRedirects[absoluteUrl] = redirectUrl;
      }
    } else {
      console.log(`${doc.locale}/${doc.slug} is direct but not REDIRECT_HTML`);
    }
  }

  processDocument(doc, absoluteUrl) {
    throw new Error("Not implemented");
  }

  saveAllRedirects() {
    throw new Error("Not implemented");
  }

  end(individualCount) {
    // all rows have been received
    this.stopProgressbar();
    this.saveAllRedirects();

    const endTime = Date.now();
    const secondsTook = (endTime - this.startTime) / 1000;
    function fmtSecs(s) {
      if (s > 60) {
        const m = Math.floor(s / 60);
        s = Math.floor(s % 60);
        return `${m}m${s}s`;
      } else {
        return s.toFixed(1);
      }
    }
    console.log(
      `Took ${fmtSecs(
        secondsTook
      )} seconds to process ${individualCount.toLocaleString()} rows.`
    );
    console.log(
      `Roughly ${(individualCount / secondsTook).toFixed(1)} rows/sec.`
    );
    this.quitCallback();
  }

  cleanSlugForFoldername(slug) {
    // return a new slug that makes it appropriate as a folder name.
    // XXX not sure what's needed here.
    return slug;
  }

  getRedirectURL(html) {
    const $ = cheerio.load(html);
    for (const a of $("a[href].redirect").toArray()) {
      const href = a.attribs.href;
      if (href.startsWith("https://developer.mozilla.org")) {
        return url.parse(href).pathname;
      } else if (href.startsWith("/") && !href.startsWith("//")) {
        return href;
      }
    }
    return null;
  }
}

/** Same as Importer but will dump to disk */
class ToDiskImporter extends Importer {
  start() {
    fs.mkdirSync(this.options.root, { recursive: true });
    super.start();
  }

  processDocument(doc, absoluteUrl) {
    const { slug, locale } = doc;
    const localeFolder = path.join(this.options.root, locale);

    const folder = path.join(localeFolder, this.cleanSlugForFoldername(slug));
    fs.mkdirSync(folder, { recursive: true });
    const htmlFile = path.join(folder, "index.html");

    // XXX As of right now, we don't have a KS shim that converts "raw Kuma HTML"
    // to rendered HTML. So we'll cheat by copying the `rendered_html`.
    // fs.writeFileSync(htmlFile, doc.html);
    fs.writeFileSync(htmlFile, doc.rendered_html);

    const metaFile = path.join(folder, "index.yaml");
    const meta = {
      title: doc.title,
      mdn_url: absoluteUrl,
      slug,
      locale,

      // XXX At the moment, we're pretending we have the KS shim, and that means
      // we'll have access to the raw (full of macros) string which'll be
      // useful to infer certain things such as how the {{Compat(...)}}
      // macro is used. But for now, we'll inject it into the metadata:
      _raw: doc.html
    };
    fs.writeFileSync(metaFile, yaml.safeDump(meta));
  }

  saveAllRedirects() {
    const byLocale = {};
    Object.entries(this.allRedirects).forEach(([fromUrl, toUrl]) => {
      const locale = fromUrl.split("/")[1];
      if (!(locale in byLocale)) {
        byLocale[locale] = [];
      }
      byLocale[locale].push([fromUrl, toUrl]);
    });
    const countPerLocale = [];
    Object.entries(byLocale).forEach(([locale, pairs]) => {
      pairs.sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      });
      countPerLocale.push([locale, pairs.length]);
      const filePath = path.join(this.options.root, locale, "_redirects.txt");
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(`# FROM-URL\tTO-URL\n`);
      pairs.forEach(([rightUrl, wrongUrl]) => {
        writeStream.write(`${wrongUrl}\t${rightUrl}\n`);
      });
      writeStream.end();
      console.log(`Wrote all ${locale} redirects to ${filePath}`);
    });

    console.log("# Redirects per locale");
    countPerLocale.sort((a, b) => b[1] - a[1]);
    countPerLocale.forEach(([locale, count]) => {
      console.log(`${locale.padEnd(10)}${count.toLocaleString()}`);
    });
  }
}

module.exports = {
  runImporter,
  DEFAULT_DATABASE_URL,
  DEFAULT_ROOT
};
