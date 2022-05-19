// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require("crypto");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'chalk'.
const chalk = require("chalk");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fm'.
const fm = require("front-matter");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'log'.
const log = require("loglevel");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fdir'.
const { fdir } = require("fdir");

const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'buildURL'.
  buildURL,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'execGit'.
  execGit,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'slugToFold... Remove this comment to see the full error message
  slugToFolder,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
  Document,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Redirect'.
  Redirect,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_RO... Remove this comment to see the full error message
  CONTENT_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_TR... Remove this comment to see the full error message
  CONTENT_TRANSLATED_ROOT,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'HTML_FILEN... Remove this comment to see the full error message
  HTML_FILENAME,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MARKDOWN_F... Remove this comment to see the full error message
  MARKDOWN_FILENAME,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
  VALID_LOCALES,
} = require("../content");

const CONFLICTING = "conflicting";
const ORPHANED = "orphaned";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'syncAllTra... Remove this comment to see the full error message
function syncAllTranslatedContent(locale) {
  if (!CONTENT_TRANSLATED_ROOT) {
    throw new Error(
      "CONTENT_TRANSLATED_ROOT must be set to sync translated content!"
    );
  }
  const redirects = new Map();
  const api = new fdir()
    .withFullPaths()
    .withErrors()
    .filter((filePath) => {
      return (
        filePath.endsWith(HTML_FILENAME) || filePath.endsWith(MARKDOWN_FILENAME)
      );
    })
    .crawl(path.join(CONTENT_TRANSLATED_ROOT, locale));
  const files = [...api.sync()];
  const stats = {
    movedDocs: 0,
    conflictingDocs: 0,
    orphanedDocs: 0,
    redirectedDocs: 0,
    totalDocs: files.length,
  };

  for (const f of files) {
    const { moved, conflicting, redirect, orphaned, followed } =
      syncTranslatedContent(f, locale);
    if (redirect) {
      redirects.set(redirect[0], redirect[1]);
    }
    if (moved) {
      stats.movedDocs += 1;
    }
    if (conflicting) {
      stats.conflictingDocs += 1;
    }
    if (orphaned) {
      stats.orphanedDocs += 1;
    }
    if (followed) {
      stats.redirectedDocs += 1;
    }
  }

  if (redirects.size > 0) {
    Redirect.add(locale, [...redirects.entries()], true);
  }

  return stats;
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'resolve'.
function resolve(slug) {
  if (!slug) {
    return slug;
  }
  const url = buildURL("en-us", slug);
  const resolved = Redirect.resolve(url);
  if (url !== resolved) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'read' does not exist on type '{ new (): ... Remove this comment to see the full error message
    const doc = Document.read(Document.urlToFolderPath(resolved));
    if (!doc) {
      return slug;
    }
    const resolvedSlug = doc.metadata.slug;
    if (slug !== resolvedSlug) {
      return resolvedSlug;
    }
  }
  return slug;
}

function syncTranslatedContent(inFilePath, locale) {
  if (!CONTENT_TRANSLATED_ROOT) {
    throw new Error(
      "CONTENT_TRANSLATED_ROOT must be set to sync translated content!"
    );
  }
  const status = {
    redirect: null,
    conflicting: false,
    moved: false,
    orphaned: false,
    followed: false,
  };

  const rawDoc = fs.readFileSync(inFilePath, "utf8");
  const fileName = path.basename(inFilePath);
  const extension = path.extname(fileName);
  const bareFileName = path.basename(inFilePath, extension);
  const { attributes: oldMetadata, body: rawBody } = fm(rawDoc);
  const resolvedSlug = resolve(oldMetadata.slug);
  const metadata = {
    ...oldMetadata,
    slug: resolvedSlug,
  };

  if (
    oldMetadata.slug.startsWith(ORPHANED) ||
    oldMetadata.slug.startsWith(CONFLICTING)
  ) {
    return status;
  }
  status.moved = oldMetadata.slug.toLowerCase() !== metadata.slug.toLowerCase();

  if (status.moved) {
    log.log(
      chalk.bold(`Original redirect: ${oldMetadata.slug} → ${metadata.slug}`)
    );
    status.followed = true;
  }

  const dehash = () => {
    const hash = metadata.slug.indexOf("#");
    if (hash < 0) {
      return;
    }
    status.moved = true;
    log.log(chalk.yellow(`${metadata.slug} contains #, stripping`));
    metadata.slug = metadata.slug.substring(0, hash);
  };

  const getFilePath = () => {
    const folderPath = path.join(
      CONTENT_TRANSLATED_ROOT,
      locale,
      slugToFolder(metadata.slug)
    );

    const filePath = path.join(folderPath, fileName);
    return filePath;
  };

  dehash();
  let filePath = getFilePath();

  status.orphaned =
    !fs.existsSync(
      path.join(
        CONTENT_ROOT,
        "en-us",
        slugToFolder(metadata.slug),
        bareFileName + ".md"
      )
    ) &&
    !fs.existsSync(
      CONTENT_ROOT,
      "en-us",
      slugToFolder(metadata.slug),
      bareFileName + ".html"
    );

  if (!status.moved && !status.orphaned) {
    return status;
  }

  if (status.orphaned) {
    log.log(chalk.yellow(`orphaned: ${inFilePath}`));
    status.followed = false;
    metadata.slug = `${ORPHANED}/${metadata.slug}`;
    status.moved = true;
    filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      log.log(`${inFilePath} → ${filePath}`);
      throw new Error(`file: ${filePath} already exists!`);
    }
  } else if (fs.existsSync(filePath)) {
    `unrooting ${inFilePath} (conflicting translation)`;
    metadata.slug = `${CONFLICTING}/${metadata.slug}`;
    status.conflicting = true;
    status.moved = true;
    filePath = getFilePath();
    if (fs.existsSync(filePath)) {
      metadata.slug = `${metadata.slug}_${crypto
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
        .createHash("md5")
        .update(oldMetadata.slug)
        .digest("hex")}`;
      filePath = getFilePath();
    }
  }

  status.redirect = [
    buildURL(VALID_LOCALES.get(locale), oldMetadata.slug),
    buildURL(VALID_LOCALES.get(locale), metadata.slug),
  ];

  log.log(`${inFilePath} → ${filePath}`);
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'updateWikiHistory' does not exist on typ... Remove this comment to see the full error message
  Document.updateWikiHistory(
    path.join(CONTENT_TRANSLATED_ROOT, locale.toLowerCase()),
    oldMetadata.slug,
    metadata.slug
  );
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  execGit(["mv", inFilePath, filePath], { cwd: CONTENT_TRANSLATED_ROOT });
  metadata.original_slug = oldMetadata.slug;
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'saveFile' does not exist on type '{ new ... Remove this comment to see the full error message
  Document.saveFile(filePath, Document.trimLineEndings(rawBody), metadata);
  try {
    fs.rmdirSync(path.dirname(inFilePath));
  } catch (e) {
    if (e.code !== "ENOTEMPTY") {
      throw e;
    }
  }
  return status;
}

function syncTranslatedContentForAllLocales() {
  let moved = 0;
  for (const locale of VALID_LOCALES.keys()) {
    if (locale == "en-us") {
      continue;
    }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'stats' does not exist on type '{ movedDo... Remove this comment to see the full error message
    const { stats: { movedDocs = 0 } = {} } = syncAllTranslatedContent(locale);
    moved += movedDocs;
  }
  return moved;
}

module.exports = {
  syncTranslatedContent,
  syncAllTranslatedContent,
  syncTranslatedContentForAllLocales,
};
