/**
 * This script does all the necessary things the `yarn client:build`
 * (react-scripts) can't do.
 *
 */
import fs from "node:fs/promises";
import path from "node:path";

import cheerio from "cheerio";
import fse from "fs-extra";
import md5File from "md5-file";

export async function runOptimizeClientBuild(buildRoot) {
  const indexHtmlFilePath = path.join(buildRoot, "index.html");
  const indexHtml = await fs.readFile(indexHtmlFilePath, "utf-8");

  const results = [];

  // For every favicon referred there, change it to a file URL that
  // has a hash in it.
  const $ = cheerio.load(indexHtml);
  const els = $('link[rel], meta[property="og:image"]').toArray();

  for (const element of els) {
    let href;
    let attributeKey;
    let hrefPrefix = "";
    if (element.tagName === "meta") {
      if (element.attribs.property !== "og:image") {
        continue;
      }
      href = element.attribs.content;
      attributeKey = "content";
      // This is an unfortunate hack. The value for the
      // <meta property=og:image content=...> needs to be an absolute URL.
      // We tested with a relative URL and it seems it doesn't work in Twitter.
      // So we hardcode the URL to be our production domain so the URL is
      // always absolute.
      // Yes, this makes it a bit weird to use a build of this on a dev,
      // stage, preview, or a local build. Especially if the hashed URL doesn't
      // always work. But it's a fair price to pay.
      hrefPrefix = "https://developer.mozilla.org";
    } else {
      href = element.attribs.href;
      if (!href) {
        continue;
      }
      const rel = element.attribs.rel;
      if (
        ![
          "icon",
          "shortcut icon",
          "apple-touch-icon",
          "apple-touch-icon-precomposed",
          "manifest",
        ].includes(rel)
      ) {
        continue;
      }
      attributeKey = "href";
    }

    // If this script is, for some reason, already run before we can
    // bail if it looks like the href already is hashed.
    if (/\.[a-f0-9]{8}\./.test(href)) {
      console.warn(`Looks like ${href} is already hashed`);
      continue;
    }
    const filePath = hrefToFilePath(buildRoot, href);
    if (!filePath || !(await fse.pathExists(filePath))) {
      console.warn(`Unable to turn '${href}' into a valid file path`);
      continue;
    }
    // 8 because that's what react-scripts (which uses webpack somehow)
    // uses to create those `build/static/**/*` files it builds.
    const fullHash = await md5File(filePath);
    const hash = fullHash.slice(0, 8);
    const extName = path.extname(filePath);
    const splitName = filePath.split(extName);
    const hashedFilePath = `${splitName[0]}.${hash}${extName}`;
    await fs.copyFile(filePath, hashedFilePath);
    const hashedHref = filePathToHref(buildRoot, hashedFilePath);
    results.push({
      filePath,
      href,
      url: hrefPrefix + hashedHref,
      hashedFilePath,
      attributeKey,
    });
  }

  if (results.length > 0) {
    // It clearly hashed some files. Let's update the HTML!
    let newIndexHtml = indexHtml;
    for (const { href, url, attributeKey } of results) {
      newIndexHtml = newIndexHtml.replace(
        new RegExp(`${attributeKey}="${href}"`),
        `${attributeKey}="${url}"`
      );
    }
    await fs.writeFile(indexHtmlFilePath, newIndexHtml, "utf-8");
  }

  return results;
}

// Turn 'C:\Path\to\client\build\favicon.ico' to '/favicon.ico'
function filePathToHref(root, filePath) {
  return `${filePath.replace(root, "").replace(path.sep, "/")}`;
}

// Turn '/favicon.ico' to 'C:\Path\to\client\build\favicon.ico'
function hrefToFilePath(root, href) {
  // The href is always expected to start with a `/` which is part of a
  // URL and not a file path.
  const pathname = new URL(href, "http://localhost.example").pathname;
  if (pathname.startsWith("/")) {
    return path.join(root, pathname.slice(1).replace(/\//g, path.sep));
  }
}
