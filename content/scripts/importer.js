const assert = require("assert").strict;
const url = require("url");
const fs = require("fs");
const path = require("path");
const stream = require("stream");
const { promisify } = require("util");

const chalk = require("chalk");
const mysql = require("mysql");
const cheerio = require("cheerio");
const yaml = require("js-yaml");
const ProgressBar = require("./progress-bar");
const { slugToFoldername } = require("./utils");
const { VALID_LOCALES } = require("./constants");

const MAX_OPEN_FILES = 256;

// Any slug that starts with one of these prefixes goes into a different
// folder; namely the archive folder.
// Case matters but 100% of Prod slugs are spelled like this. I.e.
// there's *no* slug that is something like this 'archiVe/Foo/Bar'.
const ARCHIVE_SLUG_ENGLISH_PREFIXES = [
  "Archive",
  "BrowserID",
  "Debugging",
  "Extensions",
  "Firefox_OS",
  "Garbage_MixedContentBlocker",
  "Gecko",
  "Hacking_Firefox",
  "Interfaces",
  "Mercurial",
  "Mozilla",
  "Multi-Process_Architecture",
  "NSS",
  "nsS",
  "Performance",
  "Persona",
  "Preferences_System",
  "Sandbox",
  "SpiderMonkey",
  "Thunderbird",
  "XML_Web_Services",
  "XUL",
  "XULREF",
  "Zones",
];

const OLD_LOCALE_PREFIXES = new Map([
  ["en", "en-US"],
  ["cn", "zh-CN"],
  ["zh_tw", "zh-TW"],
  ["zh", "zh-TW"],
  ["pt", "pt-PT"],
]);
// Double check that every value of the old locale mappings
// point to valid ones.
assert(
  [...OLD_LOCALE_PREFIXES.values()].every((x) =>
    [...VALID_LOCALES.values()].includes(x)
  )
);

const redirectsToArchive = new Set();
const redirectFinalDestinations = new Map();
const archiveSlugPrefixes = [...ARCHIVE_SLUG_ENGLISH_PREFIXES];

function startsWithArchivePrefix(uri) {
  return archiveSlugPrefixes.some((prefix) =>
    uriToSlug(uri).startsWith(prefix)
  );
}

function isArchiveRedirect(uri) {
  return redirectsToArchive.has(uri) || startsWithArchivePrefix(uri);
}

async function populateRedirectInfo(pool, constraintsSQL, queryArgs) {
  // Populates two data structures: "redirectsToArchive", a set of URI's
  // that ultimately redirect to a page that will be archived, as well as
  // "redirectFinalDestinations", a mapping of the URI's of redirects
  // to the URI of their final destination.

  function extractFromChain(toUri, chainOfRedirects) {
    // Recursive function that builds the set of redirects to
    // archive, as well as the map that provides the final
    // destination of each redirect that we'll keep.
    const isInfiniteLoop = chainOfRedirects.has(toUri);
    if (!isInfiniteLoop) {
      const nextUri = redirects.get(toUri);
      if (nextUri) {
        return extractFromChain(nextUri, chainOfRedirects.add(toUri));
      }
    }
    // Is the final destination meant to be archived?
    if (isInfiniteLoop || startsWithArchivePrefix(toUri)) {
      for (const uri of chainOfRedirects) {
        // All of these URI's ultimately redirect to a page that
        // will be archived or are involved in an inifinite loop.
        // We'll only add to the set of "redirectsToArchive" those
        // that are not already covered by "archiveSlugPrefixes".
        if (!startsWithArchivePrefix(uri)) {
          // console.log(`adding to archive: ${uri}`);
          redirectsToArchive.add(uri);
        }
      }
    }
    // Let's record the final destination of each URI in the chain.
    for (const uri of chainOfRedirects) {
      redirectFinalDestinations.set(uri, toUri);
    }
  }

  const redirectDocs = await queryRedirects(pool, constraintsSQL, queryArgs);

  redirectDocs.on("error", (error) => {
    console.error("Querying redirect documents failed with", error);
    process.exit(1);
  });

  const redirects = new Map();

  for await (const row of redirectDocs) {
    const fromUri = `/${row.locale}/docs/${row.slug}`;
    const redirect = processRedirect(row, fromUri);
    if (redirect && redirect.url) {
      redirects.set(fromUri, redirect.url);
    }
  }

  for (const [fromUri, toUri] of redirects.entries()) {
    extractFromChain(toUri, new Set([fromUri]));
  }
}

function getSQLConstraints(
  { alias = null, parentAlias = null, includeDeleted = false } = {},
  options
) {
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
      `NOT (${excludePrefixes.map((_) => `${a}slug LIKE ?`).join(" OR ")})`
    );
    queryArgs.push(...excludePrefixes.map((s) => `${s}%`));
    if (parentAlias) {
      extra.push(
        `((${parentAlias}.slug IS NULL) OR NOT (${excludePrefixes
          .map((_) => `${parentAlias}.slug LIKE ?`)
          .join(" OR ")}))`
      );
      queryArgs.push(...excludePrefixes.map((s) => `${s}%`));
    }
  }

  return {
    constraintsSQL: ` WHERE ${extra.join(" AND ")}`,
    queryArgs,
  };
}

async function queryContributors(query, options) {
  const [contributors, usernames] = await Promise.all([
    (async () => {
      console.log("Going to fetch ALL contributor *mappings*");
      const { constraintsSQL, queryArgs } = getSQLConstraints(
        {
          includeDeleted: true,
          alias: "d",
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
    })(),
  ]);

  return { contributors, usernames };
}

async function queryDocumentCount(query, constraintsSQL, queryArgs) {
  const localesSQL = `
    SELECT w.locale, COUNT(*) AS count
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
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

async function queryRedirects(pool, constraintsSQL, queryArgs) {
  const documentsSQL = `
    SELECT
      w.html,
      w.slug,
      w.locale,
      w.is_redirect
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL} AND w.is_redirect = true
  `;

  return pool
    .query(documentsSQL, queryArgs)
    .stream({ highWaterMark: MAX_OPEN_FILES })
    .pipe(new stream.PassThrough({ objectMode: true }));
}

async function addLocalizedArchiveSlugPrefixes(
  query,
  constraintsSQL,
  queryArgs
) {
  // Adds all of the localized versions of the English archive
  // slug prefixes to "archiveSlugPrefixes".
  const slugsSQL = `
    SELECT
      w.slug
    FROM wiki_document w
    INNER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL} AND p.slug in (?)
  `;

  queryArgs.push(ARCHIVE_SLUG_ENGLISH_PREFIXES);

  const slugsFromLocales = await query(slugsSQL, queryArgs);

  for (const slug of new Set(slugsFromLocales)) {
    if (!archiveSlugPrefixes.includes(slug)) {
      archiveSlugPrefixes.push(slug);
    }
  }
}

async function queryDocuments(pool, options) {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "w",
      parentAlias: "p",
    },
    options
  );

  const query = promisify(pool.query).bind(pool);

  await addLocalizedArchiveSlugPrefixes(query, constraintsSQL, queryArgs);
  await populateRedirectInfo(pool, constraintsSQL, queryArgs);
  const totalCount = await queryDocumentCount(query, constraintsSQL, queryArgs);

  const documentsSQL = `
    SELECT
      w.id,
      w.title,
      w.slug,
      w.locale,
      w.is_redirect,
      w.html,
      w.rendered_html,
      w.summary_text AS summary,
      w.modified,
      p.id AS parent_id,
      p.slug AS parent_slug,
      p.locale AS parent_locale,
      p.modified AS parent_modified,
      p.is_redirect AS parent_is_redirect
    FROM wiki_document w
    LEFT OUTER JOIN wiki_document p ON w.parent_id = p.id
    ${constraintsSQL}
  `;

  return {
    totalCount,
    stream: pool
      .query(documentsSQL, queryArgs)
      .stream({ highWaterMark: MAX_OPEN_FILES })
      // node MySQL uses custom streams which are not iterable. Piping it through a native stream fixes that
      .pipe(new stream.PassThrough({ objectMode: true })),
  };
}

async function queryDocumentTags(query, options) {
  const { constraintsSQL, queryArgs } = getSQLConstraints(
    {
      alias: "w",
    },
    options
  );
  const sql = `
    SELECT
      w.id,
      t.name
    FROM wiki_document w
    INNER JOIN wiki_taggeddocument wt ON wt.content_object_id = w.id
    INNER JOIN wiki_documenttag t ON t.id = wt.tag_id
    ${constraintsSQL}
  `;

  console.log("Going to fetch ALL document tags");
  const results = await query(sql, queryArgs);
  const tags = {};
  for (const row of results) {
    if (!(row.id in tags)) {
      tags[row.id] = [];
    }
    tags[row.id].push(row.name);
  }
  return tags;
}

async function withTimer(label, fn) {
  console.time(label);
  const result = await fn();
  console.timeEnd(label);
  return result;
}

function isArchiveDoc(row) {
  return (
    archiveSlugPrefixes.some(
      (prefix) =>
        row.slug.startsWith(prefix) ||
        (row.parent_slug && row.parent_slug.startsWith(prefix))
    ) ||
    (row.is_redirect && isArchiveRedirect(`/${row.locale}/docs/${row.slug}`)) ||
    (row.parent_slug &&
      row.parent_is_redirect &&
      isArchiveRedirect(`/${row.parent_locale}/docs/${row.parent_slug}`))
  );
}

function uriToSlug(uri) {
  if (uri.includes("/docs/")) {
    return uri.split("/docs/")[1];
  }
  return uri;
}

async function prepareRoots(options) {
  if (!options.archiveRoot) throw new Error("woot?!");
  if (!options.root) throw new Error("waat?!");
  if (options.root === options.archiveRoot) throw new Error("eh?!");
  if (options.startClean) {
    // Experimental new feature
    // https://nodejs.org/api/fs.html#fs_fs_rmdirsync_path_options
    await withTimer(`Delete all of ${options.root}`, () =>
      fs.rmdirSync(options.root, { recursive: true })
    );
    await withTimer(`Delete all of ${options.archiveRoot}`, () =>
      fs.rmdirSync(options.archiveRoot, { recursive: true })
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
   * and sometimes it's like this:
   *   'REDIRECT <a class="redirect" href="/en-US/docs/https://developer.mozilla.org/en-US/docs/Mozilla">Firefox Marketplace FAQ</a>'
   *
   * So we need the "best of both worlds".
   * */
  const $ = cheerio.load(html);
  for (const a of $("a[href].redirect").toArray()) {
    const hrefHref = $(a).attr("href");
    const hrefText = $(a).text();

    if (hrefHref.includes("http://")) {
      // Life's too short to accept these. Not only is it scary to even
      // consider sending our users to a http:// site but it's not
      // even working in Kuma because in Kuma redirects that
      // start with '/docs/http://..' end up in a string of redirects
      // and eventually fails with a 404.
      return null;
    }

    let href;
    if (hrefHref.startsWith("https://")) {
      href = hrefHref;
    } else if (
      hrefHref.includes("/https://") &&
      hrefText.startsWith("https://")
    ) {
      href = hrefText;
    } else if (hrefHref.includes("/https://")) {
      href = "https://" + hrefHref.split("https://")[1];
    } else {
      href = hrefHref;
    }
    if (href.startsWith("https://developer.mozilla.org")) {
      return url.parse(href).pathname;
    } else {
      return href;
    }
  }
  return null;
}

function test_getRedirectURL(href, text, expect) {
  const h = `REDIRECT <a class="redirect" href="${href}">${text}</a>`;
  const r = getRedirectURL(h);
  assert(r === expect, `${r}  !=  ${expect}`);
}

test_getRedirectURL(
  "/en-US/docs/Persona",
  "/en-US/docs/Persona",
  "/en-US/docs/Persona"
);
test_getRedirectURL(
  "/en-US/docs/Persona",
  "Persona was cool",
  "/en-US/docs/Persona"
);
test_getRedirectURL(
  "/docs/En/NsIPlacesView",
  "En/NsIPlacesView",
  "/docs/En/NsIPlacesView"
);
test_getRedirectURL(
  "/docs/https://wiki.commonjs.org/wiki/Binary",
  "https://wiki.commonjs.org/wiki/Binary",
  "https://wiki.commonjs.org/wiki/Binary"
);
test_getRedirectURL(
  "/docs/http://wiki.commonjs.org/wiki/Binary",
  "http://wiki.commonjs.org/wiki/Binary",
  null
);
test_getRedirectURL(
  "/docs/https://wiki.commonjs.org/wiki/Binary",
  "Plain text",
  "https://wiki.commonjs.org/wiki/Binary"
);

test_getRedirectURL(
  "https://developer.mozilla.org/en-US/docs/Mozilla/Projects/",
  "SpiderMonkey",
  "/en-US/docs/Mozilla/Projects/"
);
test_getRedirectURL(
  "/en-US/docs/https://developer.mozilla.org/en-US/docs/Mozilla/Marketplace",
  "Firefox Marketplace",
  "/en-US/docs/Mozilla/Marketplace"
);
test_getRedirectURL(
  "/en-US/docs/tools/Keyboard_shortcuts#Source_editor",
  "/en-US/docs/tools/Keyboard_shortcuts",
  "/en-US/docs/tools/Keyboard_shortcuts#Source_editor"
);
test_getRedirectURL(
  "https://www.peterbe.com/",
  "Peterbe.com",
  "https://www.peterbe.com/"
);

const REDIRECT_HTML = "REDIRECT <a ";

// Return either 'null' or an object that looks like this:
//
//  { url: redirectURL, status: null };
//  or
//  { url: null, status: "mess" }
//  or
//  { url: fixedRedirectURL, status: "improved" }
//
// So basically, if it's an object it has the keys 'url' and 'status'.
function processRedirect(doc, absoluteURL) {
  if (!doc.html.includes(REDIRECT_HTML)) {
    console.log(`${doc.locale}/${doc.slug} is redirect but no REDIRECT_HTML`);
    return null;
  }

  let redirectURL = getRedirectURL(doc.html);
  if (!redirectURL) {
    return null;
  }

  if (redirectURL.includes("://")) {
    if (
      redirectURL.includes("developer.mozilla.org") ||
      redirectURL.includes("/http")
    ) {
      console.warn(
        "WEIRD REDIRECT:",
        redirectURL,
        "  FROM  ",
        `https://developer.mozilla.org${encodeURI(absoluteURL)}`,
        doc.html
      );
    }
    // Generally, leave external redirects untouched
    return { url: redirectURL, status: null };
  }

  return postProcessRedirectURL(redirectURL);
}

function postProcessRedirectURL(redirectURL) {
  if (redirectURL === "/") {
    return { url: "/en-US/", status: "improved" };
  }
  const split = redirectURL.split("/");
  let locale;
  if (split[1] === "docs") {
    // E.g. /docs/en/JavaScript
    locale = split[2];
  } else if (split[2] == "docs") {
    // E.g. /en/docs/HTML
    locale = split[1];
  } else if (!split.includes("docs")) {
    // E.g. /en-us/Addons
    locale = split[1];
  } else {
    // That's some seriously messed up URL!
    locale = null;
  }

  if (locale) {
    const localeLC = locale.toLowerCase();
    if (OLD_LOCALE_PREFIXES.has(localeLC)) {
      locale = OLD_LOCALE_PREFIXES.get(localeLC);
    } else if (VALID_LOCALES.has(localeLC)) {
      locale = VALID_LOCALES.get(localeLC);
    } else {
      // If the URL contains no recognizable locale that can be cleaned up
      // we have to assume 'en-US'. There are so many redirect URLs
      // in MySQL that look like this: '/docs/Web/JavaScript...'
      // And for them we have to assume it's '/en-US/docs/Web/JavaScript...'
      locale = "en-US";
      split.splice(1, 0, locale);
    }
  }

  // No valid locale found. We have to try to fix that manually.
  if (!locale) {
    console.log(split, { redirectURL });
    throw new Error("WHAT THE HELL?");
  }

  // E.g. '/en/' or '/en-uS/' or '/fr'
  if (!split.includes("docs") && split.filter((x) => x).length === 1) {
    return { url: `/${locale}/`, status: null };
  }

  // E.g. '/en/docs/Foo' or '/en-us/docs/Foo' - in other words; perfect
  // but the locale might need to be corrected
  if (split[2] === "docs") {
    if (locale !== split[1]) {
      split[1] = locale;
      return { url: split.join("/"), status: "improved" };
    }
    return { url: split.join("/"), status: null };
  }

  // E.g. '/en-US/Foo/Bar' or '/en/Foo/Bar'
  if (!split.includes("docs")) {
    // The locale is valid but it's just missing the '/docs/' part
    split[1] = locale;
    split.splice(2, 0, "docs");
    return { url: split.join("/"), status: "improved" };
  }

  // E.g. '/docs/en-uS/Foo' or '/docs/cn/Foo'
  if (split[1] === "docs") {
    split.splice(2, 1); // remove the local after '/docs/'
    split.splice(1, 0, locale); // put the (correct) locale in before
    return { url: split.join("/"), status: "improved" };
  }

  return { url: null, status: "mess" };
}

function test_postProcessRedirectURL(a, b) {
  let got = postProcessRedirectURL(a);
  if (b) {
    assert(got.url === b, `${got.url} != ${b}`);
  } else {
    assert(!got.url, `Expected null but got: ${JSON.stringify(got)}`);
  }
}
test_postProcessRedirectURL("/", "/en-US/");
test_postProcessRedirectURL("/en-US/", "/en-US/");
test_postProcessRedirectURL("/en-US", "/en-US/");
test_postProcessRedirectURL("/en-us", "/en-US/");
test_postProcessRedirectURL("/en/", "/en-US/");
test_postProcessRedirectURL("/en", "/en-US/");

test_postProcessRedirectURL("/en-US/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en-uS/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/zh/Foo", "/zh-TW/docs/Foo");
test_postProcessRedirectURL("/pt/Foo", "/pt-PT/docs/Foo");

test_postProcessRedirectURL("/docs/en-US/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/EN-us/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/en/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/docs/cn/Foo", "/zh-CN/docs/Foo");

test_postProcessRedirectURL("/docs/cn/Foo", "/zh-CN/docs/Foo");
test_postProcessRedirectURL("/docs/Foo", "/en-US/docs/Foo");

test_postProcessRedirectURL("/en-us/docs/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en/docs/Foo", "/en-US/docs/Foo");
test_postProcessRedirectURL("/en-US/docs/Foo", "/en-US/docs/Foo");

// Global that keeps track of all meta files that get built.
// It's used so that we can make absolutely sure that we don't
// build something that was already built as that would indicate
// that two different slugs lead to the exact same name as a file.
const allBuiltMetaFiles = new Set();

async function processDocument(
  doc,
  { archiveRoot, root, startClean },
  isArchive = false,
  { usernames, contributors, tags }
) {
  const { slug, locale, title, summary } = doc;
  const localeFolder = path.join(
    isArchive ? archiveRoot : root,
    locale.toLowerCase()
  );

  const folder = path.join(localeFolder, slugToFoldername(slug));
  await fs.promises.mkdir(folder, { recursive: true });
  const htmlFile = path.join(folder, "index.html");

  if (isArchive) {
    await fs.promises.writeFile(htmlFile, doc.rendered_html);
  } else {
    await fs.promises.writeFile(htmlFile, doc.html);
  }

  const wikiHistoryFile = path.join(folder, "wikihistory.json");
  const metaFile = path.join(folder, "index.yaml");
  if (startClean && allBuiltMetaFiles.has(metaFile)) {
    throw new Error(`${path.resolve(metaFile)} already exists! slug:${slug}`);
  } else {
    allBuiltMetaFiles.add(metaFile);
  }

  const meta = {
    title,
    slug,
    summary,
  };
  if (doc.parent_slug) {
    assert(doc.parent_locale === "en-US");
    if (doc.parent_is_redirect) {
      const parentUri = `/${doc.parent_locale}/docs/${doc.parent_slug}`;
      const finalUri = redirectFinalDestinations.get(parentUri);
      meta.translation_of = uriToSlug(finalUri);
    } else {
      meta.translation_of = doc.parent_slug;
    }
  }

  const wikiHistory = {
    modified: doc.modified.toISOString(),
    _generated: new Date().toISOString(),
  };

  const docTags = tags[doc.id] || [];
  if (docTags.length) {
    meta.tags = docTags.sort();
  }
  await fs.promises.writeFile(metaFile, yaml.safeDump(meta));

  const docContributors = (contributors[doc.id] || []).map(
    (userId) => usernames[userId]
  );
  if (docContributors.length) {
    wikiHistory.contributors = docContributors;
  }
  await fs.promises.writeFile(
    wikiHistoryFile,
    JSON.stringify(wikiHistory, null, 2)
  );
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
  for (const [locale, pairs] of Object.entries(byLocale)) {
    pairs.sort((a, b) => {
      if (a[0] < b[0]) return -1;
      if (a[0] > b[0]) return 1;
      return 0;
    });
    countPerLocale.push([locale, pairs.length]);
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

module.exports = async function runImporter(options) {
  options = { locales: [], excludePrefixes: [], ...options };

  await prepareRoots(options);

  const pool = mysql.createPool(options.dbURL);

  console.log(
    `Going to try to connect to ${pool.config.connectionConfig.database} (locales=${options.locales})`
  );
  console.log(
    `Going to exclude the following slug prefixes: ${options.excludePrefixes}`
  );

  const query = promisify(pool.query).bind(pool);
  const [{ usernames, contributors }, tags] = await Promise.all([
    withTimer("Time to fetch all contributors", () =>
      queryContributors(query, options)
    ),
    withTimer("Time to fetch all document tags", () =>
      queryDocumentTags(query, options)
    ),
  ]);

  let startTime = Date.now();

  const documents = await queryDocuments(pool, options);

  const progressBar = !options.noProgressbar
    ? new ProgressBar({
        includeMemory: true,
      })
    : null;

  if (!options.noProgressbar) {
    progressBar.init(documents.totalCount);
  }

  documents.stream.on("error", (error) => {
    console.error("Querying documents failed with", error);
    process.exit(1);
  });

  let processedDocumentsCount = 0;
  let pendingDocuments = 0;

  const redirects = {};
  let improvedRedirects = 0;
  let messedupRedirects = 0;
  let discardedRedirects = 0;
  let archivedRedirects = 0;
  let fastForwardedRedirects = 0;

  for await (const row of documents.stream) {
    processedDocumentsCount++;

    while (pendingDocuments > MAX_OPEN_FILES) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    pendingDocuments++;
    (async () => {
      const currentDocumentIndex = processedDocumentsCount;
      // Only update (and repaint) every 20th time.
      // Make it much more than every 1 time or else it'll flicker.
      if (progressBar && currentDocumentIndex % 20 == 0) {
        progressBar.update(currentDocumentIndex);
      }

      const isArchive = isArchiveDoc(row);
      if (row.is_redirect) {
        if (isArchive) {
          // This redirect or its parent is a page that will
          // be archived, or eventually arrives at a page that
          // will be archived. So just drop it!
          archivedRedirects++;
          return;
        }
        const absoluteUrl = `/${row.locale}/docs/${row.slug}`;
        const redirect = processRedirect(row, absoluteUrl);
        if (!redirect) {
          discardedRedirects++;
          return;
        }
        if (redirect.url) {
          const finalUri = redirectFinalDestinations.get(absoluteUrl);
          if (redirect.url !== finalUri) {
            fastForwardedRedirects++;
          }
          redirects[absoluteUrl] = finalUri;
        }
        if (redirect.status == "mess") {
          messedupRedirects++;
        } else if (redirect.status == "improved") {
          improvedRedirects++;
        }
      } else {
        await processDocument(row, options, isArchive, {
          usernames,
          contributors,
          tags,
        });
      }
    })()
      .catch((err) => {
        console.log("An error occured during processing");
        console.error(err);
        // The slightest unexpected error should stop the importer immediately.
        process.exit(1);
      })
      .then(() => {
        pendingDocuments--;
      });
  }

  if (!options.noProgressbar) {
    progressBar.stop();
  }

  pool.end();
  await saveAllRedirects(redirects, options.root);

  if (improvedRedirects) {
    console.log(
      chalk.bold(improvedRedirects.toLocaleString()),
      "redirects were corrected as they used the old URL style."
    );
  }
  if (messedupRedirects) {
    console.log(
      chalk.bold(messedupRedirects.toLocaleString()),
      "redirects were ignored because they would lead to an infinite redirect loop."
    );
  }
  if (discardedRedirects) {
    console.log(
      chalk.bold(discardedRedirects.toLocaleString()),
      "redirects that could not be imported."
    );
  }
  if (archivedRedirects) {
    console.log(
      chalk.bold(archivedRedirects.toLocaleString()),
      "redirects that are considered archived content ignored."
    );
  }
  if (fastForwardedRedirects) {
    console.log(
      chalk.bold(fastForwardedRedirects.toLocaleString()),
      "redirects were fast-forwarded directly to their final destination."
    );
  }

  const endTime = Date.now();
  const secondsTook = (endTime - startTime) / 1000;
  console.log(
    chalk.green(
      `Took ${formatSeconds(secondsTook)} seconds to process ${chalk.bold(
        processedDocumentsCount.toLocaleString()
      )} rows.`
    )
  );
  console.log(
    `Roughly ${(processedDocumentsCount / secondsTook).toFixed(1)} rows/sec.`
  );
};
