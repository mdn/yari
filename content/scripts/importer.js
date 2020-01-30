const url = require("url");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
const cheerio = require("cheerio");
const sanitizeFilename = require("sanitize-filename");
const yaml = require("js-yaml");

const ProgressBar = require("ssr/progress-bar");

const REDIRECT_HTML = "REDIRECT <a ";

function runImporter(options, logger) {
  const creds = url.parse(options.dbURL);
  const host = creds.host; // XXX should it be creds.hostname??
  const user = (creds.auth && creds.auth.split(":")[0]) || "";
  const password = (creds.auth && creds.auth.split(":")[1]) || "";
  const database = creds.pathname.split("/")[1];

  logger.info(
    `Going to try to connect to ${database} (locales=${options.locales})`
  );
  logger.info(
    `Going to exclude the following slug prefixes: ${options.excludePrefixes}`
  );

  const connection = mysql.createConnection({
    host,
    user,
    password,
    database
  });
  connection.connect();

  const importer = new ToDiskImporter(connection, options, logger, () => {
    connection.end();
  });

  console.time("Time to fetch all contributors");
  importer
    .fetchAllContributors()
    .then(() => {
      console.timeEnd("Time to fetch all contributors");
      importer.start();
    })
    .catch(err => {
      throw err;
    });
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
  constructor(connection, options, logger, quitCallback) {
    this.connection = connection;
    this.options = options;
    this.logger = logger;
    this.quitCallback = quitCallback;

    // A map of document_id => [user_id, user_idX, user_idY]
    // where the user IDs are inserted in a descending order. Meaning, the
    // user IDs of the *most recently created document revisions* come first.
    this.allContributors = {};
    // Just a map of user_id => username
    this.allUsernames = {};

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
    // Count of how many rows we've processed
    let individualCount = 0;
    let totalCount = 0; // this'll soon be set by the first query

    this.startTime = Date.now();

    // Let's warm up by seeing we can connect to the wiki_document table
    // and extract some stats.
    const { constraintsSQL, queryArgs } = this._getSQLConstraints({
      alias: "w"
    });
    let sql = `
      SELECT
      w.locale, COUNT(*) AS count
      FROM wiki_document w ${constraintsSQL}
    `;
    sql += " group by w.locale ORDER by count DESC ";

    // First make a table of locale<->counts
    this.connection.query(sql, queryArgs, (error, results) => {
      if (error) {
        console.error("Unable to connect to MySQL.");
        throw error;
      }

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
      // return this.quitCallback();

      // If something needs to be done to where files will be written.
      this.prepareRoot();

      this.initProgressbar(totalCount);

      // Actually do the imported
      sql = `
        SELECT
          w.id,
          w.title,
          w.slug,
          w.locale,
          w.is_redirect,
          w.html,
          w.rendered_html,
          w.modified,
          p.id AS parent_id,
          p.slug AS parent_slug,
          p.locale AS parent_locale,
          p.modified AS parent_modified
        FROM wiki_document w
        LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
        ${constraintsSQL}
      `;

      const query = this.connection.query(sql, queryArgs);
      query
        .on("error", err => {
          // Handle error, an 'end' event will be emitted after this as well
          console.error("Error event!");
          throw err;
        })
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

  fetchAllContributors() {
    const { constraintsSQL, queryArgs } = this._getSQLConstraints({
      joinTable: "wiki_document",
      includeDeleted: true,
      alias: "d"
    });
    let sql =
      `SELECT r.document_id, r.creator_id FROM wiki_revision r
      inner join wiki_document d on r.document_id = d.id
      ` + constraintsSQL;
    sql += " ORDER BY r.created DESC ";

    return new Promise((resolve, reject) => {
      console.log("Going to fetch ALL contributor *mappings*");
      this.connection.query(sql, queryArgs, (error, results) => {
        if (error) {
          return reject(error);
        }
        const contributors = {};
        results.forEach(result => {
          if (!(result.document_id in contributors)) {
            contributors[result.document_id] = []; // Array because order matters
          }
          if (!contributors[result.document_id].includes(result.creator_id)) {
            contributors[result.document_id].push(result.creator_id);
          }
        });
        this.allContributors = contributors;

        console.log("Going to fetch ALL contributor *usernames*");
        let sql = "SELECT id, username FROM auth_user";
        this.connection.query(sql, queryArgs, (error, results) => {
          if (error) {
            return reject(error);
          }
          const usernames = {};
          results.forEach(result => {
            usernames[result.id] = result.username;
          });
          this.allUsernames = usernames;

          resolve();
        });
      });
    });
  }

  _getSQLConstraints({
    joinTable = null,
    alias = null,
    includeDeleted = false
  } = {}) {
    // Yeah, this is ugly but it bloody works for now.
    const a = alias ? `${alias}.` : "";
    const extra = [];
    const queryArgs = [];

    if (!includeDeleted) {
      extra.push(`${a}deleted = false`);
    }
    const { locales, excludePrefixes } = this.options;
    if (locales.length) {
      extra.push(`${a}locale in (?)`);
      queryArgs.push(locales);
    }
    if (excludePrefixes.length) {
      extra.push(
        "NOT (" + excludePrefixes.map(_ => `${a}slug LIKE ?`).join(" OR ") + ")"
      );
      queryArgs.push(...excludePrefixes.map(s => `${s}%`));
    }

    let sql = " ";
    if (joinTable) {
      sql += `INNER JOIN ${joinTable} ON document_id=${joinTable}.id `;
    }

    return {
      constraintsSQL: sql + extra.length ? ` WHERE ${extra.join(" AND ")}` : "",
      queryArgs
    };
  }

  prepareRoot() {
    // In case anything needs to be done to this.options.root
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
        if (redirectUrl.includes("://")) {
          console.warn(
            "WEIRD REDIRECT:",
            redirectUrl,
            "  FROM  ",
            `https://developer.mozilla.org${encodeURI(absoluteUrl)}`,
            doc.html
          );
        }
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
    return slug
      .toLowerCase()
      .split(path.sep)
      .map(sanitizeFilename)
      .join(path.sep);
  }

  getRedirectURL(html) {
    /**
     * Sometimes the HTML is like this:
     *   'REDIRECT <a class="redirect" href="/docs/http://wiki.commonjs.org/wiki/C_API">http://wiki.commonjs.org/wiki/C_API</a>'
     * and sometimes it's like this:
     *   'REDIRECT <a class="redirect" href="/en-US/docs/Web/API/WebGL_API">WebGL</a>'
     *
     * So we need the "best of both worlds".
     * */
    const $ = cheerio.load(html);
    for (const a of $("a[href].redirect").toArray()) {
      const hrefHref = $(a).attr("href");
      const hrefText = $(a).text();
      let href;
      if (
        hrefHref.startsWith("/docs/http") ||
        hrefHref.startsWith("/docs/en/http")
      ) {
        href = hrefText;
      } else {
        href = hrefHref;
      }
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
  prepareRoot() {
    if (this.options.startClean) {
      // Experimental new feature
      // https://nodejs.org/api/fs.html#fs_fs_rmdirsync_path_options
      const label = `Delete all of ${this.options.root}`;
      console.time(label);
      fs.rmdirSync(this.options.root, { recursive: true });
      console.timeEnd(label);
    }
    fs.mkdirSync(this.options.root, { recursive: true });
  }

  processDocument(doc, absoluteUrl) {
    const { slug, locale } = doc;
    const localeFolder = path.join(this.options.root, locale.toLowerCase());

    const folder = path.join(localeFolder, this.cleanSlugForFoldername(slug));
    fs.mkdirSync(folder, { recursive: true });
    const htmlFile = path.join(folder, "index.html");

    // XXX As of right now, we don't have a KS shim that converts "raw Kuma HTML"
    // to rendered HTML. So we'll cheat by copying the `rendered_html`.
    // fs.writeFileSync(htmlFile, doc.html);
    fs.writeFileSync(htmlFile, `${doc.rendered_html}`);

    const metaFile = path.join(folder, "index.yaml");
    const contributors = (this.allContributors[doc.id] || []).map(
      userId => this.allUsernames[userId]
    );

    const meta = {
      title: doc.title,
      mdn_url: absoluteUrl,
      slug,
      locale,
      modified: doc.modified,
      mdn_contributors: contributors
    };
    if (doc.parent_slug && doc.parent_locale) {
      meta.parent = {
        slug: doc.parent_slug,
        locale: doc.parent_locale,
        modified: doc.parent_modified
      };
    }
    fs.writeFileSync(metaFile, yaml.safeDump(meta));
    // XXX At the moment, we're pretending we have the KS shim, and that means
    // we'll have access to the raw (full of macros) string which'll be
    // useful to infer certain things such as how the {{Compat(...)}}
    // macro is used. But for now, we'll inject it into the metadata:
    const rawFile = path.join(folder, "raw.html");
    fs.writeFileSync(rawFile, doc.html);
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
      pairs.forEach(([fromUrl, toUrl]) => {
        writeStream.write(`${fromUrl}\t${toUrl}\n`);
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
  runImporter
};
