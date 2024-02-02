import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";

import * as cheerio from "cheerio";
import got from "got";
import { fileTypeFromBuffer } from "file-type";
import imagemin from "imagemin";
import imageminPngquantPkg from "imagemin-pngquant";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminGifsicle from "imagemin-gifsicle";
import imageminSvgo from "imagemin-svgo";
import { rgPath } from "@vscode/ripgrep";
import sanitizeFilename from "sanitize-filename";

import {
  ANY_ATTACHMENT_REGEXP,
  VALID_MIME_TYPES,
} from "../libs/constants/index.js";
import { FileAttachment } from "../content/index.js";
import { BLOG_ROOT } from "../libs/env/index.js";

const { default: imageminPngquant } = imageminPngquantPkg;

export function humanFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const num = size / 1024 ** i;
  const round = Math.round(num);

  let str: string;
  if (round < 10) {
    str = num.toFixed(2);
  } else if (round < 100) {
    str = num.toFixed(1);
  } else {
    str = String(round);
  }

  return `${str} ${"KMGTPEZY"[i - 1]}B`;
}

// We have a lot of images that *should* be external, at least for the sake
// of cleaning up, but aren't. E.g. `/@api/deki/files/247/=HTMLBlinkElement.gif`
// These get logged as external images by the flaw detection, but to actually
// be able to process them and fix the problem we need to "temporarily"
// pretend they were hosted on a remote working full domain.
// See https://github.com/mdn/yari/issues/1103
export function forceExternalURL(url: string) {
  if (url.startsWith("/")) {
    return `https://mdn.mozillademos.org${url}`;
  }
  return url;
}

export async function downloadAndResizeImage(
  src: string,
  out: string,
  basePath: string
) {
  const imageResponse = await got(forceExternalURL(src), {
    responseType: "buffer",
    timeout: { request: 10000 },
    retry: { limit: 3 },
  });
  const imageBuffer = imageResponse.body;
  let fileType = await fileTypeFromBuffer(imageBuffer);
  if (
    !fileType &&
    src.toLowerCase().endsWith(".svg") &&
    imageResponse.headers["content-type"]
      .toLowerCase()
      .startsWith("image/svg+xml")
  ) {
    // If the SVG doesn't have the `<?xml version="1.0" encoding="UTF-8"?>`
    // and/or the `<!DOCTYPE svg PUBLIC ...` in the first couple of bytes
    // the FileType.fromBuffer will fail.
    // But if the image URL and the response Content-Type are sane, we
    // can safely assumes it's an SVG file.
    fileType = {
      ext: "xml",
      mime: "application/xml",
    };
  }
  if (!fileType) {
    throw new Error(
      `No file type could be extracted from ${src} at all. Probably not going to be a valid image file.`
    );
  }
  const isSVG =
    fileType.mime === "application/xml" && src.toLowerCase().endsWith(".svg");

  if (!(VALID_MIME_TYPES.has(fileType.mime) || isSVG)) {
    throw new Error(`${src} has an unrecognized mime type: ${fileType.mime}`);
  }
  // Otherwise FileType would make it `.xml`
  const imageExtension = isSVG ? "svg" : fileType.ext;
  const imageBasename = sanitizeFilename(
    `${path.basename(out, path.extname(out))}.${imageExtension}`
  );
  const destination = path.join(
    basePath,
    path
      .basename(imageBasename)
      // Names like `screenshot-(1).png` are annoying because the `(` often
      // has to be escaped when working on the command line.
      .replace(/[()]/g, "")
      .replace(/\s+/g, "_")
      // From legacy we have a lot of images that are named like
      // `/@api/deki/files/247/=HTMLBlinkElement.gif` for example.
      // Take this opportunity to clean that odd looking leading `=`.
      .replace(/^=/, "")
      .toLowerCase()
  );
  // Before writing to disk, run it through the same imagemin
  // compression we do in the filecheck CLI.
  const compressedImageBuffer = await imagemin.buffer(imageBuffer, {
    plugins: [getImageminPlugin(src)],
  });
  if (compressedImageBuffer.length < imageBuffer.length) {
    console.log(
      `Raw image size: ${humanFileSize(
        imageBuffer.length
      )} Compressed: ${humanFileSize(compressedImageBuffer.length)}`
    );
    fs.writeFileSync(destination, compressedImageBuffer);
  } else {
    console.log(`Raw image size: ${humanFileSize(imageBuffer.length)}`);
    fs.writeFileSync(destination, imageBuffer);
  }
  return destination;
}

export function getImageminPlugin(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") {
    return imageminMozjpeg();
  }
  if (extension === ".png") {
    return imageminPngquant();
  }
  if (extension === ".gif") {
    return imageminGifsicle();
  }
  if (extension === ".svg") {
    return imageminSvgo();
  }
  throw new Error(`No imagemin plugin for ${extension}`);
}

export function splitSections(rawHTML) {
  const $ = cheerio.load(`<div id="_body">${rawHTML}</div>`);
  const blocks = [];
  const toc = [];

  const section = cheerio
    .load("<div></div>", { decodeEntities: false })("div")
    .eq(0);

  const iterable = [...($("#_body")[0] as cheerio.Element).childNodes];
  let c = 0;
  iterable.forEach((child) => {
    if ("tagName" in child && child.tagName === "h2") {
      if (c) {
        blocks.push(section.clone());
        section.empty();
        c = 0;
      }
      const text = $(child).text();
      const id = text.replace(/[ .,!?]+/g, "-").toLowerCase();
      toc.push({ id, text });
      child.attribs = { ...(child.attribs || {}), id };
    }
    c++;
    section.append(child);
  });
  if (c) {
    blocks.push(section.clone());
  }

  const sections = blocks.map((block) => block.html().trim());
  return { sections, toc };
}

/**
 * Return an array of all images that are inside the documents source folder.
 *
 * @param {Document} document
 */
export function getAdjacentFileAttachments(documentDirectory: string) {
  const dirents = fs.readdirSync(documentDirectory, { withFileTypes: true });
  return dirents
    .filter((dirent) => {
      // This needs to match what we do in filecheck/checker.py
      return !dirent.isDirectory() && ANY_ATTACHMENT_REGEXP.test(dirent.name);
    })
    .map((dirent) => path.join(documentDirectory, dirent.name));
}
/**
 * Find all tags that we need to change to tell tools like Google Translate
 * to not translate.
 *
 * @param {Cheerio document instance} $
 */
export function injectNoTranslate($) {
  $("pre").addClass("notranslate");
}

/**
 * For every image and iframe, where appropriate add the `loading="lazy"` attribute.
 *
 * @param {Cheerio document instance} $
 */
export function injectLoadingLazyAttributes($) {
  $("img:not([loading]), iframe:not([loading])").attr("loading", "lazy");
}

/**
 * For every `<a href="http...">` make it
 * `<a href="http..." class="external" and rel="noopener">`
 *
 *
 * @param {Cheerio document instance} $
 */
export function postProcessExternalLinks($) {
  $("a[href^=http]").each((i, element) => {
    const $a = $(element);
    if ($a.attr("href").startsWith("https://developer.mozilla.org")) {
      // This should have been removed since it's considered a flaw.
      // But we haven't applied all fixable flaws yet and we still have to
      // support translated content which is quite a long time away from
      // being entirely treated with the fixable flaws cleanup.
      return;
    }
    $a.addClass("external");
    $a.attr("target", "_blank");
  });
}

/**
 * For every `<a href="... curriculum ... .md ...">` remove the ".md"
 *
 * @param {Cheerio document instance} $
 * @param {current url} url
 */
export function postProcessCurriculumLinks($, url) {
  $("a[href^=./]").each((_, element) => {
    // Expand relative links (TODO: fix)
    const $a = $(element);
    $a.attr("href", $a.attr("href").replace(/^\.\//, `${url}`));
  });
  $("a[href^=/en-US/curriculum]").each((_, element) => {
    const $a = $(element);
    $a.attr("href", $a.attr("href").replace(/(.*)\.md(#.*|$)/, "$1/$2"));
  });
  $("a[href^=/curriculum]").each((_, element) => {
    const $a = $(element);
    $a.attr("href", $a.attr("href").replace(/(.*)\.md(#.*|$)/, "/en-US$1/$2"));
  });
  $("a[href^=/en-US/curriculum]").each((_, element) => {
    const $a = $(element);
    $a.attr("href", $a.attr("href").replace(/\d+-/g, ""));
  });
}

/**
 * For every `<a href="THING">`, where 'THING' is not a http or / link, make it
 * `<a href="$CURRENT_PATH/THING">`
 *
 *
 * @param {Cheerio document instance} $
 */
export function postLocalFileLinks($, doc) {
  $("a[href]").each((i, element) => {
    const href = element.attribs.href;

    // This test is merely here to quickly bail if there's no hope to find the
    // file attachment as a local file link. There are a LOT of hyperlinks
    // throughout the content and this simple if statement means we can skip 99%
    // of the links, so it's presumed to be worth it.
    if (
      !href ||
      /^(\/|\.\.|http|#|mailto:|about:|ftp:|news:|irc:|ftp:)/i.test(href)
    ) {
      return;
    }
    // There are a lot of links that don't match. E.g. `<a href="SubPage">`
    // So we'll look-up a lot "false positives" that are not file attachments.
    // Thankfully, this lookup is fast.
    const url = `${doc.mdn_url}/${href}`;
    const fileAttachment = FileAttachment.findByURLWithFallback(url);
    if (fileAttachment) {
      $(element).attr("href", url);
    }
  });
}

/**
 * Fix the heading IDs so they're all lower case.
 *
 * @param {Cheerio document instance} $
 */
export function postProcessSmallerHeadingIDs($) {
  $("h4[id], h5[id], h6[id]").each((i, element) => {
    const id = element.attribs.id;
    const lcID = id.toLowerCase();
    if (id !== lcID) {
      $(element).attr("id", lcID);
    }
  });
}

/**
 * Return an array of objects like this [{text: ..., id: ...}, ...]
 * from a document's body.
 * This will be used for the "Table of Contents" menu which expects to be able
 * to link to each section with anchor links.
 *
 * @param {Document} doc
 */
export function makeTOC(doc, withH3 = false) {
  return doc.body
    .map((section) => {
      if (
        (section.type === "prose" ||
          section.type === "browser_compatibility" ||
          section.type === "specifications") &&
        section.value.id &&
        section.value.title &&
        (!section.value.isH3 || withH3)
      ) {
        return { text: section.value.title, id: section.value.id };
      }
      return null;
    })
    .filter(Boolean);
}

export function findPostFileBySlug(slug: string): string | null {
  if (!BLOG_ROOT) {
    console.warn("'BLOG_ROOT' not set in .env file");
    return null;
  }

  try {
    const { stdout, stderr, status } = spawnSync(rgPath, [
      "-il",
      `slug: ${slug}`,
      BLOG_ROOT,
    ]);
    if (status === 0) {
      const file = stdout.toString("utf-8").split("\n")[0];
      return file;
    }
    const message = stderr.toString();
    if (message) {
      console.error(`error running rg: ${message}`);
    } else {
      console.error(`Post ${slug} not found in ${BLOG_ROOT}`);
    }
  } catch {
    console.error("rg failed");
  }
  return null;
}

const POST_URL_RE = /^\/en-US\/blog\/([^/]+)\/?$/;

export function getSlugByBlogPostUrl(url: string): string | null {
  return url.match(POST_URL_RE)?.[1] || null;
}

export async function importJSON<T>(jsonPath: string): Promise<T> {
  if (!jsonPath.startsWith(".")) {
    jsonPath = path.join(cwd(), "node_modules", jsonPath);
  }

  const json = await readFile(jsonPath, "utf-8");

  return JSON.parse(json);
}
