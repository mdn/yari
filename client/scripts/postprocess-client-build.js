/**
 * This script does all the necessary things the `yarn client:build`
 * (react-scripts) can't do.
 *
 */
import fs from "node:fs";
import path from "node:path";

import cheerio from "cheerio";
import md5File from "md5-file";

export async function hashSomeStaticFilesForClientBuild(buildRoot) {
  const indexHtmlFilePath = path.join(buildRoot, "index.html");
  const indexHtml = fs.readFileSync(indexHtmlFilePath, "utf-8");

  const results = [];

  // For every favicon referred there, change it to a file URL that
  // has a hash in it.
  const $ = cheerio.load(indexHtml);
  $('link[rel], meta[property="og:image"]').each((i, element) => {
    let href;
    let attributeKey;
    let hrefPrefix = "";
    if (element.tagName === "meta") {
      if (element.attribs.property !== "og:image") {
        return;
      }
      // This is a can of worms. Using from environment for now.
      // We need to use an absolute URL for "og:image".
      hrefPrefix = process.env.BASE_URL || "";
      href = element.attribs.content;
      attributeKey = "content";
    } else {
      href = element.attribs.href;
      if (!href) {
        return;
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
        return;
      }
      attributeKey = "href";
    }

    // If this script is, for some reason, already run before we can
    // bail if it looks like the href already is hashed.
    if (/\.[a-f0-9]{8}\./.test(href)) {
      console.warn(`Looks like ${href} is already hashed`);
      return;
    }
    const filePath = hrefToFilePath(buildRoot, href);
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn(`Unable to turn '${href}' into a valid file path`);
      return;
    }
    // 8 because that's what react-scripts (which uses webpack somehow)
    // uses to create those `build/static/**/*` files it builds.
    const hash = md5File.sync(filePath).slice(0, 8);
    const extName = path.extname(filePath);
    const splitName = filePath.split(extName);
    const hashedFilePath = `${splitName[0]}.${hash}${extName}`;
    fs.copyFileSync(filePath, hashedFilePath);
    const hashedHref = filePathToHref(buildRoot, hashedFilePath, href);
    results.push({
      filePath,
      href,
      url: hrefPrefix + hashedHref,
      hashedFilePath,
      attributeKey,
    });
  });

  if (results.length > 0) {
    // It clearly hashed some files. Let's update the HTML!
    let newIndexHtml = indexHtml;
    for (const { href, url, attributeKey } of results) {
      newIndexHtml = newIndexHtml.replace(
        new RegExp(`${attributeKey}="${href}"`),
        `${attributeKey}="${url}"`
      );
    }
    fs.writeFileSync(indexHtmlFilePath, newIndexHtml, "utf-8");
  }

  return { results };
}

// Turn 'C:\Path\to\client\build\favicon.ico' to '/favicon.ico'
// or 'https://foo.bar/favicon.ico' if href is an absolute URL.
function filePathToHref(root, filePath, href) {
  let dummyOrExistingUrl = new URL(href, "http://localhost.example");
  dummyOrExistingUrl.pathname = "";
  let url = new URL(
    `${filePath.replace(root, "").replace(path.sep, "/")}`,
    dummyOrExistingUrl
  );
  if (url.hostname === "localhost.example") {
    return url.pathname;
  } else {
    return url.href;
  }
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
