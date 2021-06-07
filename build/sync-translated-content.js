const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const glob = require("glob");
const chalk = require("chalk");
const fm = require("front-matter");
const log = require("loglevel");

const {
  buildURL,
  execGit,
  slugToFolder,
  Document,
  Redirect,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  VALID_LOCALES,
} = require("../content");

const CONFLICTING = "conflicting";
const ORPHANED = "orphaned";

function syncAllTranslatedContent(locale) {
  if (!CONTENT_TRANSLATED_ROOT) {
    throw new Error(
      "CONTENT_TRANSLATED_ROOT must be set to sync translated content!"
    );
  }
  const redirects = new Map();
  const files = glob.sync(
    path.join(CONTENT_TRANSLATED_ROOT, locale, "**", "index.html")
  );
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

function resolve(slug) {
  if (!slug) {
    return slug;
  }
  const url = buildURL("en-us", slug);
  const resolved = Redirect.resolve(url);
  if (url !== resolved) {
    const doc = Document.read(resolved);
    if (!doc) {
      return slug;
    }
    const resolvedSlug = doc.url;
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

  status.orphaned = !fs.existsSync(
    path.join(CONTENT_ROOT, "en-us", slugToFolder(metadata.slug), fileName)
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
  Document.updateWikiHistory(
    path.join(CONTENT_TRANSLATED_ROOT, locale.toLowerCase()),
    oldMetadata.slug,
    metadata.slug
  );
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  execGit(["mv", inFilePath, filePath], { cwd: CONTENT_TRANSLATED_ROOT });
  metadata.original_slug = oldMetadata.slug;
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
