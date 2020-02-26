import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import { promisify } from "util";
import * as url from "url";
import * as cheerio from "cheerio";
import * as mysql from "mysql";
import { Pool } from "mysql";
const sanitizeFilename = require("sanitize-filename");
import * as yaml from "js-yaml";
import * as ProgressBar from "ssr/progress-bar";

function getSQLConstraints(
  {
    joinTable = null,
    alias = null,
    includeDeleted = false
  }: { joinTable?: string; alias?: string; includeDeleted?: boolean } = {},
  options
): {
  constraintsSQL: string;
  queryArgs: string[];
} {
  // Yeah, this is ugly but it bloody works for now.
  const a = alias ? `${alias}.` : "";
  const extra = [];
  const queryArgs = [];
  // Always exclude these. These are straggler documents that don't yet
  // have a revision
  extra.push(`${a}current_revision_id IS NOT NULL`);
  // There aren't many but these get excluded in kuma anyway.
  extra.push(`${a}html <> ''`);

  if (!includeDeleted) {
    extra.push(`${a}deleted = false`);
  }
  const { locales, excludePrefixes } = options;
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

async function fetchAllContributors(query, options) {
  const [contributors, usernames] = await Promise.all([
    (async () => {
      console.log("Going to fetch ALL contributor *mappings*");
      const { constraintsSQL, queryArgs } = getSQLConstraints(
        {
          joinTable: "wiki_document",
          includeDeleted: true,
          alias: "d"
        },
        options
      );
      const documentCreators = await query(
        `
          SELECT r.document_id, r.creator_id
          FROM wiki_revision r
          INNER JOIN wiki_document d ON r.document_id = d.id
          ${constraintsSQL}
          ORDER BY r.created DESC
        `,
        queryArgs
      );
      const contributors = {};
      for (const { document_id, creator_id } of documentCreators) {
        if (!(document_id in contributors)) {
          contributors[document_id] = []; // Array because order matters
        }
        if (!contributors[document_id].includes(creator_id)) {
          contributors[document_id].push(creator_id);
        }
      }
      return contributors;
    })(),
    (async () => {
      console.log("Going to fetch ALL contributor *usernames*");
      const users = await query("SELECT id, username FROM auth_user");
      const usernames = {};
      for (const user of users) {
        usernames[user.id] = user.username;
      }
      return usernames;
    })()
  ]);

  return { contributors, usernames };
}

async function fetchAllTranslationRelationships(
  query,
  options
): Promise<{ [id: string]: string }> {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "d"
    },
    options
  );
  const sql = `
    SELECT d.id, d.parent_id, d.slug, d.locale
    FROM wiki_document d
    ${constraintsSQL} AND d.parent_id IS NOT NULL
    ORDER BY d.locale
  `;

  console.log("Going to fetch ALL parents");
  const results = await query(sql, queryArgs);
  const translations = {};
  for (const row of results) {
    if (!(row.parent_id in translations)) {
      translations[row.parent_id] = [];
    }
    translations[row.parent_id].push({
      slug: row.slug,
      locale: row.locale
    });
  }
  return translations;
}

async function queryDocumentCount(query, constraintsSQL, queryArgs) {
  const localesSQL = `
    SELECT w.locale, COUNT(*) AS count
    FROM wiki_document w
    ${constraintsSQL}
    GROUP BY w.locale
    ORDER BY count DESC
  `;
  const results = await query(localesSQL, queryArgs);

  let totalCount = 0;
  console.log(`LOCALE\tDOCUMENTS`);
  let countNonEnUs = 0;
  let countEnUs = 0;
  for (const { count, locale } of results) {
    console.log(`${locale}\t${count.toLocaleString()}`);
    totalCount += count;
    if (locale === "en-US") {
      countEnUs += count;
    } else {
      countNonEnUs += count;
    }
  }

  if (countNonEnUs && countEnUs) {
    const nonEnUsPercentage = (100 * countNonEnUs) / (countNonEnUs + countEnUs);
    console.log(
      `(FYI ${countNonEnUs.toLocaleString()} (${nonEnUsPercentage.toFixed(
        1
      )}%) are non-en-US)`
    );
  }

  return totalCount;
}

async function queryDocuments(
  pool: Pool,
  options
): Promise<{ totalCount: number; stream: stream.Readable }> {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "w"
    },
    options
  );

  const query = promisify(pool.query).bind(pool);
  const totalCount = await queryDocumentCount(query, constraintsSQL, queryArgs);
  const outStream = new stream.PassThrough({
    objectMode: true,
    highWaterMark: 500
  });
  const documentsSQL = `
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
  pool
    .query(documentsSQL, queryArgs)
    .on("error", err => {
      outStream.emit("error", err);
    })
    .on("result", row => {
      outStream.write(row);
    })
    .on("end", () => {
      outStream.end();
    });

  return {
    totalCount,
    stream: outStream
  };
}

async function withTimer<T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<T> {
  console.time(label);
  const result = await fn();
  console.timeEnd(label);
  return result;
}

async function prepareRoot(options) {
  if (options.startClean) {
    // Experimental new feature
    // https://nodejs.org/api/fs.html#fs_fs_rmdirsync_path_options
    await withTimer(`Delete all of ${options.root}`, () =>
      (fs.rmdirSync as any)(options.root, { recursive: true })
    );
  }
  fs.mkdirSync(options.root, { recursive: true });
}

function getRedirectURL(html) {
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

const REDIRECT_HTML = "REDIRECT <a ";
function processRedirect(
  doc,
  absoluteURL
):
  | null
  | { url: null; status: "mess" }
  | { url: string; status: null | "improved" } {
  if (!doc.html.includes(REDIRECT_HTML)) {
    console.log(`${doc.locale}/${doc.slug} is direct but not REDIRECT_HTML`);
    return null;
  }

  const redirectURL = getRedirectURL(doc.html);
  if (!redirectURL) {
    return null;
  }

  if (redirectURL.includes("://")) {
    console.warn(
      "WEIRD REDIRECT:",
      redirectURL,
      "  FROM  ",
      `https://developer.mozilla.org${encodeURI(absoluteURL)}`,
      doc.html
    );
  }

  if (!redirectURL.startsWith("/docs/")) {
    return { url: redirectURL, status: null };
  }

  const split = redirectURL.split("/");
  let locale = split[2];
  if (locale === "en") {
    locale = "en-US";
  }
  split.splice(2, 1);
  split.splice(1, 0, locale);
  const fixedRedirectURL = split.join("/");
  return fixedRedirectURL === absoluteURL
    ? { url: null, status: "mess" }
    : { url: fixedRedirectURL, status: "improved" };
}

function cleanSlugForFoldername(slug) {
  return slug
    .toLowerCase()
    .split(path.sep)
    .map(sanitizeFilename)
    .join(path.sep);
}

function processDocument(doc, root, { usernames, contributors, translations }) {
  const { slug, locale, title } = doc;
  const localeFolder = path.join(root, locale.toLowerCase());

  const folder = path.join(localeFolder, cleanSlugForFoldername(slug));
  fs.mkdirSync(folder, { recursive: true });
  const htmlFile = path.join(folder, "index.html");

  // XXX As of right now, we don't have a KS shim that converts "raw Kuma HTML"
  // to rendered HTML. So we'll cheat by copying the `rendered_html`.
  // fs.writeFileSync(htmlFile, doc.html);
  fs.writeFileSync(htmlFile, `${doc.rendered_html}`);

  const wikiHistoryFile = path.join(folder, "wikihistory.yaml");
  const metaFile = path.join(folder, "index.yaml");

  const meta: any = {
    title,
    slug,
    locale
  };
  const wikiHistory: any = {
    modified: doc.modified.toISOString()
  };

  if (doc.parent_slug && doc.parent_locale) {
    meta.parent = {
      slug: doc.parent_slug,
      locale: doc.parent_locale
    };
  }

  const otherTranslations = translations[doc.id] || [];
  if (otherTranslations.length) {
    meta.other_translations = otherTranslations;
  }

  const docContributors = (contributors[doc.id] || []).map(
    userId => usernames[userId]
  );
  if (docContributors.length) {
    wikiHistory.mdn_contributors = docContributors;
  }
  fs.writeFileSync(metaFile, yaml.safeDump(meta));

  const generatedComment = `# Auto generated by Yari importer ${new Date().toISOString()}`;
  fs.writeFileSync(
    wikiHistoryFile,
    `${generatedComment}\n${yaml.safeDump(wikiHistory)}\n`
  );

  // XXX At the moment, we're pretending we have the KS shim, and that means
  // we'll have access to the raw (full of macros) string which'll be
  // useful to infer certain things such as how the {{Compat(...)}}
  // macro is used. But for now, we'll inject it into the metadata:
  const rawFile = path.join(folder, "raw.html");
  fs.writeFileSync(rawFile, doc.html);
}

async function saveAllRedirects(redirects, root) {
  const byLocale = {};
  for (const [fromUrl, toUrl] of Object.entries(redirects)) {
    const locale = fromUrl.split("/")[1];
    if (!(locale in byLocale)) {
      byLocale[locale] = [];
    }
    byLocale[locale].push([fromUrl, toUrl]);
  }

  const countPerLocale = [];
  for (const [locale, pairs] of Object.entries(byLocale) as any[]) {
    pairs.sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    countPerLocale.push([locale, pairs.length]);
    const filePath = path.join(root, locale, "_redirects.txt");
    const localeFolder = path.join(root, locale);
    if (!fs.existsSync(localeFolder)) {
      console.log(
          `No content for ${locale}, so skip ${pairs.length} redirects`
      );
    } else {
      const filePath = path.join(localeFolder, "_redirects.txt");
      const writeStream = fs.createWriteStream(filePath);
      writeStream.write(`# FROM-URL\tTO-URL\n`);
      pairs.forEach(([fromUrl, toUrl]) => {
        writeStream.write(`${fromUrl}\t${toUrl}\n`);
      });
      writeStream.end();
      console.log(`Wrote all ${locale} redirects to ${filePath}`);
    }
  }

  console.log("# Redirects per locale");
  countPerLocale.sort((a, b) => b[1] - a[1]);
  for (const [locale, count] of countPerLocale) {
    console.log(`${locale.padEnd(10)}${count.toLocaleString()}`);
  }
}

function formatSeconds(s) {
  if (s > 60) {
    const m = Math.floor(s / 60);
    s = Math.floor(s % 60);
    return `${m}m${s}s`;
  } else {
    return s.toFixed(1);
  }
}

export default async function runImporter(options) {
  options = { locales: [], excludePrefixes: [], ...options };

  await prepareRoot(options);

  const pool = mysql.createPool(options.dbURL);

  console.log(
    `Going to try to connect to ${
      (pool.config as any).connectionConfig.database
    } (locales=${options.locales})`
  );
  console.log(
    `Going to exclude the following slug prefixes: ${options.excludePrefixes}`
  );

  const query = promisify(pool.query).bind(pool);
  const [{ usernames, contributors }, translations] = await Promise.all([
    withTimer("Time to fetch all contributors", () =>
      fetchAllContributors(query, options)
    ),
    withTimer("Time to fetch all translation relationships", () =>
      fetchAllTranslationRelationships(query, options)
    )
  ]);

  let startTime = Date.now();

  const documents = await queryDocuments(pool, options);

  const progressBar = !options.noProgressbar
    ? new ProgressBar({
        includeMemory: true
      })
    : null;

  progressBar.init(documents.totalCount);

  documents.stream.on("error", error => {
    console.error("Querying documents failed with", error);
    process.exit(1);
  });

  let processedDocumentsCount = 0;
  const redirects = {};
  let improvedRedirects = 0;
  let messedupRedirects = 0;
  for await (const row of documents.stream) {
    processedDocumentsCount++;
    // Only update (and repaint) every 20th time.
    // Make it much more than every 1 time or else it'll flicker.
    if (processedDocumentsCount % 20 == 0 && progressBar) {
      progressBar.update(processedDocumentsCount);
    }

    if (row.is_redirect) {
      const absoluteUrl = `/${row.locale}/docs/${row.slug}`;
      const redirect = processRedirect(row, absoluteUrl);
      if (!redirect) {
        continue;
      }
      if (redirect.url) {
        redirects[absoluteUrl] = redirect.url;
      }
      if (redirect.status == "mess") {
        messedupRedirects++;
      } else if (redirect.status == "improved") {
        improvedRedirects++;
      }
    } else {
      processDocument(row, options.root, {
        usernames,
        contributors,
        translations
      });
    }
  }

  progressBar.stop();
  pool.end();
  await saveAllRedirects(redirects, options.root);

  if (improvedRedirects) {
    console.log(
      `${improvedRedirects.toLocaleString()} redirects were corrected as they used the old URL style.`
    );
  }
  if (messedupRedirects) {
    console.log(
      `${messedupRedirects} redirects were ignored because they would lead to an infinite redirect loop.`
    );
  }

  const endTime = Date.now();
  const secondsTook = (endTime - startTime) / 1000;
  console.log(
    `Took ${formatSeconds(
      secondsTook
    )} seconds to process ${processedDocumentsCount.toLocaleString()} rows.`
  );
  console.log(
    `Roughly ${(processedDocumentsCount / secondsTook).toFixed(1)} rows/sec.`
  );
}
