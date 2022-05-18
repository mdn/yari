const fs = require("fs");
const path = require("path");

const cheerio = require("cheerio");
const got = require("got");
const FileType = require("file-type");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGifsicle = require("imagemin-gifsicle");
const imageminSvgo = require("imagemin-svgo");
const sanitizeFilename = require("sanitize-filename");

const { VALID_MIME_TYPES } = require("../libs/constants");

function humanFileSize(size) {
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

  return `${num} ${"KMGTPEZY"[i - 1]}B`;
}

// We have a lot of images that *should* be external, at least for the sake
// of cleaning up, but aren't. E.g. `/@api/deki/files/247/=HTMLBlinkElement.gif`
// These get logged as external images by the flaw detection, but to actually
// be able to process them and fix the problem we need to "temporarily"
// pretend they were hosted on a remote working full domain.
// See https://github.com/mdn/yari/issues/1103
export function forceExternalURL(url) {
  if (url.startsWith("/")) {
    return `https://mdn.mozillademos.org${url}`;
  }
  return url;
}

export async function downloadAndResizeImage(src, out, basePath) {
  const imageResponse = await got(forceExternalURL(src), {
    responseType: "buffer",
    timeout: 10000,
    retry: 3,
  });
  const imageBuffer = imageResponse.body;
  let fileType = await FileType.fromBuffer(imageBuffer);
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

export function getImageminPlugin(fileName) {
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

  const iterable = [...$("#_body")[0].childNodes];
  let c = 0;
  iterable.forEach((child) => {
    if (child.tagName === "h2") {
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
