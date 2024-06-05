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

export async function syncAllTranslatedContent(locale: string) {
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

  const files = [...(api.sync() as any)].sort();
  const stats = {
    conflictingDocs: 0,
    movedDocs: 0,
    orphanedDocs: 0,
    redirectedDocs: 0,
    renamedDocs: 0,
    updatedDocs: 0,
    totalDocs: files.length,
  };

  for (const f of files) {
    const {
      conflicting,
      moved,
      followed,
      orphaned,
      redirect,
      renamed,
      updated,
    } = await syncTranslatedContent(f, locale);
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
    if (updated) {
      stats.updatedDocs += 1;
    }
  }

  if (redirects.size > 0) {
    Redirect.add(locale, [...redirects.entries()]);
  }

  return stats;
}

const SIDEBAR_MACRO_REGEX =
  /\{\{\s*(AccessibilitySidebar|AddonSidebar|AddonSidebarMain|APIRef|CSSRef|DefaultAPISidebar|FirefoxSidebar|GamesSidebar|GlossarySidebar|HTMLSidebar|HTTPSidebar|JSRef|JsSidebar|LearnSidebar|ListSubpagesForSidebar|MathMLRef|MDNSidebar|PWASidebar|QuicklinksWithSubPages|SVGRef|WebAssemblySidebar|XsltSidebar)(\s*\([^)}]*\))?\s*\}\}/gi;
const SLUGS_WITHOUT_SIDEBAR = [
  "Learn/Forms/User_input_methods", // NO sidebar
  "Related", // NO sidebar
  "Web", // INLINE sidebar with {{ListSubpages}}
  "Web/API", // NO sidebar
  "Web/API/Document_Object_Model/Using_the_Document_Object_Model/Example", // NO sidebar
  "Web/API/FragmentDirective", // NO sidebar
  "Web/API/Navigator/registerProtocolHandler/Web-based_protocol_handlers", // NO sidebar
  "Web/CSS/CSS_fonts/WOFF", // NO sidebar
  "Web/Demos", // NO sidebar
  "Web/Events", // INLINE sidebar with {{ListSubpages}}
  "Web/Guide/CSS/CSS_Layout", // NO sidebar
  "Web/Guide/CSS/Getting_started/Challenge_solutions", // NO sidebar
  "Web/EXSLT", // INLINE sidebar
  "Web/Media/Formats/Support_issues", // NO sidebar
  "Web/Security", // INLINE sidebar with {{ListSubpages}}
  "Web/Text_fragments", // NO sidebar
  "Web/Tutorials", // NO sidebar
];
const SLUGS_WITH_MULTIPLE__SIDEBARS = [
  "Web/API/BluetoothRemoteGATTCharacteristic/getDescriptor", // has APIRef twice
  "Web/API/BluetoothRemoteGATTCharacteristic/getDescriptors", // has APIRef twice
  "Web/HTML/Attributes/crossorigin", // has HTMLSidebar (correct) + QuickLinksWithSubpages
];

function extractMacroCall(slug, rawContent) {
  if (
    slug.startsWith("conflicting/") ||
    rawContent.includes('section id="Quick_links"')
  ) {
    return true;
  }
  const sidebarMacros = new Set(
    [...rawContent.matchAll(SIDEBAR_MACRO_REGEX)].map((match) => match[0])
  );

  if (
    sidebarMacros.size == 0 &&
    !(
      SLUGS_WITHOUT_SIDEBAR.includes(slug) ||
      slug.startsWith("Learn/WebGL/By_example/") ||
      slug.startsWith("Learn/Server-side/Express_Nodejs/") ||
      slug.startsWith("Web/API/WebGL_API/By_example") ||
      (slug.startsWith("Learn/") && slug.includes("/Example"))
    )
  ) {
    //console.warn(`${slug} has no sidebar.`);
  } else if (
    sidebarMacros.size > 1 &&
    !(
      SLUGS_WITH_MULTIPLE__SIDEBARS.includes(slug) ||
      slug.startsWith("MDN/Writing_guidelines/") ||
      slug.startsWith("Web/API/BluetoothRemoteGATT")
    )
  ) {
    //console.warn(`${slug} has multiple macros: ${[...sidebarMacros.values()].join(' | ')}`);
    return true;
  }

  return Array.from(sidebarMacros)[0] ?? null;
}

function resolve(slug: string): { slug: string; macro: string | true | null } {
  if (!slug) {
    return {
      slug,
      macro: null,
    };
  }
  const url = buildURL(DEFAULT_LOCALE_LC, slug);
  const resolved = Redirect.resolve(url);
  const doc = Document.read(Document.urlToFolderPath(resolved));

  const macro = doc ? extractMacroCall(slug, doc.rawContent) : null;

  return {
    slug: doc?.metadata.slug ?? slug,
    macro,
  };
}

function mdOrHtmlExists(folderPath: string) {
  return (
    fs.existsSync(path.join(folderPath, MARKDOWN_FILENAME)) ||
    fs.existsSync(path.join(folderPath, HTML_FILENAME))
  );
}

export async function syncTranslatedContent(
  inFilePath: string,
  locale: string
) {
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
    updated: false,
  };

  const rawDoc = fs.readFileSync(inFilePath, "utf-8");
  const fileName = path.basename(inFilePath);
  const result = fm<DocFrontmatter>(rawDoc);
  const oldMetadata = result.attributes;
  let rawBody = result.body;
  const macro = extractMacroCall(oldMetadata.slug, rawBody);
  const { slug: resolvedSlug, macro: resolvedMacro } = resolve(
    oldMetadata.slug
  );

  if (!macro && resolvedMacro && resolvedMacro !== true) {
    const firstLine = rawBody.split("\n").at(0);
    rawBody = [
      resolvedMacro,
      firstLine.startsWith("{{") && firstLine.endsWith("}}") ? "" : "\n\n",
      rawBody,
    ].join("");
    status.updated = true;
  }

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

  const getFileDir = () => {
    return path.join(
      CONTENT_TRANSLATED_ROOT,
      locale,
      slugToFolder(metadata.slug)
    );
  };

  dehash();
  let folderPath = getFileDir();

  status.orphaned = !mdOrHtmlExists(
    path.join(CONTENT_ROOT, DEFAULT_LOCALE_LC, slugToFolder(metadata.slug))
  );

  if (!status.renamed && !status.orphaned && !status.updated) {
    return status;
  }

  if (status.orphaned) {
    log.log(chalk.yellow(`orphaned: ${inFilePath}`));
    status.followed = false;
    metadata.slug = `${ORPHANED}/${metadata.slug}`;
    status.moved = true;
    folderPath = getFileDir();
    if (mdOrHtmlExists(folderPath)) {
      const filePath = path.join(folderPath, fileName);
      log.log(`${inFilePath} → ${filePath}`);
      throw new Error(`file: ${filePath} already exists!`);
    }
  } else if (status.moved && mdOrHtmlExists(folderPath)) {
    console.log(`unrooting ${inFilePath} (conflicting translation)`);
    metadata.slug = `${CONFLICTING}/${metadata.slug}`;
    status.conflicting = true;
    folderPath = getFileDir();
    if (mdOrHtmlExists(folderPath)) {
      metadata.slug = `${metadata.slug}_${crypto
        .createHash("md5")
        .update(oldMetadata.slug)
        .digest("hex")}`;
      folderPath = getFileDir();
    }
  }

  const filePath = path.join(folderPath, fileName);
  if (status.renamed || status.orphaned) {
    status.redirect = [
      buildURL(VALID_LOCALES.get(locale), oldMetadata.slug),
      buildURL(VALID_LOCALES.get(locale), metadata.slug),
    ];

    log.log(`${inFilePath} → ${filePath}`);
    await Document.updateWikiHistory(
      path.join(CONTENT_TRANSLATED_ROOT, locale.toLowerCase()),
      oldMetadata.slug,
      metadata.slug
    );

    if (status.moved) {
      moveContent(path.dirname(inFilePath), folderPath);
      metadata.original_slug = oldMetadata.slug;
    }
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

export async function syncTranslatedContentForAllLocales() {
  let moved = 0;
  for (const locale of VALID_LOCALES.keys()) {
    if (locale === DEFAULT_LOCALE_LC) {
      continue;
    }
    const { movedDocs } = await syncAllTranslatedContent(locale);
    moved += movedDocs;
  }
  return moved;
}
