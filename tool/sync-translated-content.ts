import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

import chalk from "chalk";
import fm from "front-matter";
import log from "loglevel";
import { fdir } from "fdir";

import {
  buildURL,
  execGit,
  slugToFolder,
  Document,
  Redirect,
} from "../content/index.js";
import {
  DEFAULT_LOCALE,
  HTML_FILENAME,
  MARKDOWN_FILENAME,
  VALID_LOCALES,
} from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";
import { DocFrontmatter } from "../libs/types/document.js";

const CONFLICTING = "conflicting";
const ORPHANED = "orphaned";

const DEFAULT_LOCALE_LC = DEFAULT_LOCALE.toLowerCase();

export function syncAllTranslatedContent(locale: string) {
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
  const files = [...(api.sync() as any)];
  const stats = {
    conflictingDocs: 0,
    movedDocs: 0,
    orphanedDocs: 0,
    redirectedDocs: 0,
    renamedDocs: 0,
    totalDocs: files.length,
  };

  for (const f of files) {
    const { conflicting, moved, followed, orphaned, redirect, renamed } =
      syncTranslatedContent(f, locale);
    if (conflicting) {
      stats.conflictingDocs += 1;
    }
    if (moved) {
      stats.movedDocs += 1;
    }
    if (followed) {
      stats.redirectedDocs += 1;
    }
    if (orphaned) {
      stats.orphanedDocs += 1;
    }
    if (redirect) {
      redirects.set(redirect[0], redirect[1]);
    }
    if (renamed) {
      stats.renamedDocs += 1;
    }
  }

  if (redirects.size > 0) {
    Redirect.add(locale, [...redirects.entries()]);
  }

  return stats;
}

function resolve(slug: string) {
  if (!slug) {
    return slug;
  }
  const url = buildURL(DEFAULT_LOCALE_LC, slug);
  const resolved = Redirect.resolve(url);
  const doc = Document.read(Document.urlToFolderPath(resolved));
  return doc?.metadata.slug ?? slug;
}

function mdOrHtmlExists(filePath: string) {
  const dir = path.dirname(filePath);
  return (
    fs.existsSync(path.join(dir, MARKDOWN_FILENAME)) ||
    fs.existsSync(path.join(dir, HTML_FILENAME))
  );
}

export function syncTranslatedContent(inFilePath: string, locale: string) {
  if (!CONTENT_TRANSLATED_ROOT) {
    throw new Error(
      "CONTENT_TRANSLATED_ROOT must be set to sync translated content!"
    );
  }
  const status = {
    redirect: null,
    conflicting: false,
    followed: false,
    moved: false,
    orphaned: false,
    renamed: false,
  };

  const rawDoc = fs.readFileSync(inFilePath, "utf-8");
  const fileName = path.basename(inFilePath);
  const { attributes: oldMetadata, body: rawBody } = fm<DocFrontmatter>(rawDoc);
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
  // Any case-sensitive change is (at least) a rename.
  status.renamed = oldMetadata.slug !== metadata.slug;
  // Any case-insensitive change is a move.
  status.moved =
    status.renamed &&
    oldMetadata.slug.toLowerCase() !== metadata.slug.toLowerCase();

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

  status.orphaned = !mdOrHtmlExists(
    path.join(CONTENT_ROOT, DEFAULT_LOCALE_LC, slugToFolder(metadata.slug))
  );

  if (!status.renamed && !status.orphaned) {
    return status;
  }

  if (status.orphaned) {
    log.log(chalk.yellow(`orphaned: ${inFilePath}`));
    status.followed = false;
    metadata.slug = `${ORPHANED}/${metadata.slug}`;
    status.moved = true;
    filePath = getFilePath();
    if (mdOrHtmlExists(filePath)) {
      log.log(`${inFilePath} → ${filePath}`);
      throw new Error(`file: ${filePath} already exists!`);
    }
  } else if (status.moved && mdOrHtmlExists(filePath)) {
    console.log(`unrooting ${inFilePath} (conflicting translation)`);
    metadata.slug = `${CONFLICTING}/${metadata.slug}`;
    status.conflicting = true;
    filePath = getFilePath();
    if (mdOrHtmlExists(filePath)) {
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
  if (status.moved) {
    moveContent(path.dirname(inFilePath), path.dirname(filePath));
    metadata.original_slug = oldMetadata.slug;
  }
  Document.saveFile(filePath, Document.trimLineEndings(rawBody), metadata);

  return status;
}

// Move all regular files (excluding subdirectories) from one directory to another,
// and delete the source directory if it's empty.
function moveContent(inFileDir: string, outFileDir: string) {
  const files = fs.readdirSync(inFileDir, {
    encoding: "utf-8",
    withFileTypes: true,
  });
  fs.mkdirSync(outFileDir, { recursive: true });
  const regularFiles = files
    .filter((file) => file.isFile())
    .map((file) => file.name);
  for (const filename of regularFiles) {
    const source = path.join(inFileDir, filename);
    execGit(["mv", source, outFileDir], { cwd: CONTENT_TRANSLATED_ROOT });
  }
  // assuming that the source directory is empty
  if (files.length === regularFiles.length) {
    try {
      fs.rmdirSync(inFileDir);
    } catch (e: any) {
      if (e.code !== "ENOTEMPTY") {
        throw e;
      }
    }
  }
}

export function syncTranslatedContentForAllLocales() {
  let moved = 0;
  for (const locale of VALID_LOCALES.keys()) {
    if (locale === DEFAULT_LOCALE_LC) {
      continue;
    }
    const { movedDocs } = syncAllTranslatedContent(locale);
    moved += movedDocs;
  }
  return moved;
}
