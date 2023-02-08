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
  HTML_FILENAME,
  MARKDOWN_FILENAME,
  VALID_LOCALES,
} from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";
import { DocFrontmatter } from "../libs/types/document.js";

const CONFLICTING = "conflicting";
const ORPHANED = "orphaned";

export function syncAllTranslatedContent(locale) {
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
    Redirect.add(locale, [...redirects.entries()]);
  }

  return stats;
}

function resolve(slug: string) {
  if (!slug) {
    return slug;
  }
  const url = buildURL("en-us", slug);
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
    moved: false,
    orphaned: false,
    followed: false,
  };

  const rawDoc = fs.readFileSync(inFilePath, "utf-8");
  const fileName = path.basename(inFilePath);
  const extension = path.extname(fileName);
  const bareFileName = path.basename(inFilePath, extension);
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
  status.moved = oldMetadata.slug !== metadata.slug; // slug changes (case sensitive)
  const filePathChanged =
    status.moved &&
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
      path.join(
        CONTENT_ROOT,
        "en-us",
        slugToFolder(metadata.slug),
        bareFileName + ".html"
      )
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
    if (mdOrHtmlExists(filePath)) {
      log.log(`${inFilePath} → ${filePath}`);
      throw new Error(`file: ${filePath} already exists!`);
    }
  } else if (filePathChanged && mdOrHtmlExists(filePath)) {
    console.log(`unrooting ${inFilePath} (conflicting translation)`);
    metadata.slug = `${CONFLICTING}/${metadata.slug}`;
    status.conflicting = true;
    status.moved = true;
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
  if (filePathChanged) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    execGit(["mv", inFilePath, filePath], { cwd: CONTENT_TRANSLATED_ROOT });

    metadata.original_slug = oldMetadata.slug;
  }
  Document.saveFile(filePath, Document.trimLineEndings(rawBody), metadata);

  if (filePathChanged) {
    try {
      fs.rmdirSync(path.dirname(inFilePath));
    } catch (e: any) {
      if (e.code !== "ENOTEMPTY") {
        throw e;
      }
    }
  }

  return status;
}

export function syncTranslatedContentForAllLocales() {
  let moved = 0;
  for (const locale of VALID_LOCALES.keys()) {
    if (locale == "en-us") {
      continue;
    }
    const { movedDocs = 0 } = syncAllTranslatedContent(locale);
    moved += movedDocs;
  }
  return moved;
}
