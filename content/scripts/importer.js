const url = require("url");
const fs = require("fs");
const path = require("path");
// const { promisify } = require("util");
const mysql = require("mysql");
const cheerio = require("cheerio");
const yaml = require("js-yaml");

require("dotenv").config();

const ProgressBar = require("ssr/progress-bar");

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL || "mysql2://username:password@host/databasename";

const DEFAULT_ROOT = process.env.ROOT || path.join(__dirname, "..", "files");

const REDIRECT_HTML = "REDIRECT <a ";

// function runImporter({
//   dbURL = DEFAULT_DATABASE_URL,
//   locales = null,
//   noProgressBar = false
// }) {
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

  start(connection, options, () => {
    connection.end();
  });
  // try {
  //   start(connection, locales, () => {
  //     connection.end();
  //   });
  // } finally {
  //   connection.end();
  // }
}

function start(connection, options, quitCallback) {
  const { root } = options;
  fs.mkdirSync(root, { recursive: true });
  const { locales } = options;

  // Massive mutable for all directs
  const allRedirects = {};

  // Count of how many rows we've processed
  let individualCount = 0;
  let totalCount = 0; // this'll soon be set by the first query

  const startTime = Date.now();

  // Called after the last result in the DB cursor.
  function end() {
    // all rows have been received
    // quit();
    if (progressBar) {
      progressBar.stop();
    }
    saveAllRedirects(root, allRedirects);

    const endTime = Date.now();
    const secondsTook = (endTime - startTime) / 1000;
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
      `Wow! That took ${fmtSecs(
        secondsTook
      )} seconds to process ${individualCount} rows`
    );
    quitCallback();
  }

  function result(row) {
    individualCount++;
    if (progressBar) {
      // Only update (and repaint) every 10th time.
      individualCount % 10 == 0 && progressBar.update(individualCount);
    }
    processRow(root, row, allRedirects, () => {});
    // // Pausing the connnection is useful if your processing involves I/O
    // connection.pause();

    // processRow(row, function() {
    //   connection.resume();
    // });
  }

  let progressBar;

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
  connection.query(sql, queryArgs, (error, results) => {
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

    progressBar = !options.noProgressbar
      ? new ProgressBar({
          includeMemory: true
        })
      : null;
    if (progressBar) {
      progressBar.init(totalCount);
    }

    // Actually do the imported
    sql = `SELECT * FROM wiki_document`;
    if (locales && locales.length) {
      sql += ` WHERE locale in (?)`;
    }
    var query = connection.query(sql, queryArgs);

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
      .on("result", result)
      .on("end", end);
  });
}

function saveAllRedirects(root, allRedirects) {
  const byLocale = {};
  Object.entries(allRedirects).forEach(([fromUrl, toUrl]) => {
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
    const filePath = path.join(root, locale, "_redirects.txt");
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

function cleanSlugForFoldername(slug) {
  // return a new slug that makes it appropriate as a folder name.
  // XXX not sure what's needed
  return slug;
}

function processRow(root, row, allRedirects, resumeCallback) {
  const absoluteUrl = `/${row.locale}/docs/${row.slug}`;
  if (row.is_redirect) {
    processRedirect(allRedirects, row, absoluteUrl);
  } else {
    const localeFolder = path.join(root, row.locale);
    processDocument(localeFolder, row, absoluteUrl);
  }
  resumeCallback();
}

function processDocument(localeFolder, doc, absoluteUrl) {
  const folder = path.join(localeFolder, cleanSlugForFoldername(doc.slug));
  fs.mkdirSync(folder, { recursive: true });
  const htmlFile = path.join(folder, "index.html");
  // fs.writeFileSync(htmlFile, doc.html);
  fs.writeFileSync(htmlFile, doc.rendered_html);
  const metaFile = path.join(folder, "index.yaml");
  const meta = {
    title: doc.title,
    mdn_url: absoluteUrl
  };
  fs.writeFileSync(metaFile, yaml.safeDump(meta));
}

function processRedirect(allRedirects, doc, absoluteUrl) {
  if (doc.html.includes(REDIRECT_HTML)) {
    const redirectUrl = getRedirectURL(doc.html);
    if (redirectUrl) {
      if (redirectUrl.includes("://")) {
        console.warn(
          "WEIRD REDIRECT:",
          redirectUrl,
          "  FROM  ",
          `https://developer.mozilla.org${encodeURI(absoluteUrl)}`
        );
      }
      allRedirects[absoluteUrl] = redirectUrl;
    }
  } else {
    console.log(`${doc.locale}/${doc.slug} is direct but not REDIRECT_HTML`);
  }
}

function getRedirectURL(html) {
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

module.exports = {
  runImporter,
  DEFAULT_DATABASE_URL,
  DEFAULT_ROOT
};
