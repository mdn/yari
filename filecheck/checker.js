const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const fse = require("fs-extra");
const tempy = require("tempy");
const cheerio = require("cheerio");
const FileType = require("file-type");
const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminGifsicle = require("imagemin-gifsicle");
const imageminSvgo = require("imagemin-svgo");
const isSvg = require("is-svg");

const {
  MAX_FILE_SIZE,
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
} = require("./constants");

function formatSize(bytes) {
  if (bytes > 1024 * 1024) {
    return `${(bytes / 1024.0 / 1024.0).toFixed(1)}MB`;
  }
  if (bytes > 1024) {
    return `${(bytes / 1024.0).toFixed(1)}KB`;
  }
  return `${bytes}b`;
}

async function checkFile(filePath, options) {
  // Check that the filename is always lowercase.
  if (path.basename(filePath) !== path.basename(filePath).toLowerCase()) {
    throw new Error(
      `Base name must be lowercase (not ${path.basename(filePath)})`
    );
  }

  // Check that the file size is >0 and <MAX_FILE_SIZE.
  const stat = await promisify(fs.stat)(filePath);
  if (!stat.size) {
    throw new Error(`${filePath} is 0 bytes`);
  }
  if (stat.size > MAX_FILE_SIZE) {
    const formatted =
      stat.size > 1024 * 1024
        ? `${(stat.size / 1024.0 / 1024).toFixed(1)}MB`
        : `${(stat.size / 1024.0).toFixed(1)}KB`;
    const formattedMax = `${(MAX_FILE_SIZE / 1024.0 / 1024).toFixed(1)}MB`;
    throw new Error(
      `${filePath} is too large (${formatted} > ${formattedMax})`
    );
  }

  // FileType can't check for .svg files.
  // So use special case for files called '*.svg'
  if (path.extname(filePath) === ".svg") {
    // SVGs must not contain any script tags
    const content = fs.readFileSync(filePath, "utf-8");
    if (!isSvg(content)) {
      throw new Error(`${filePath} does not appear to be an SVG`);
    }
    const $ = cheerio.load(content);
    const disallowedTagNames = new Set(["script", "object", "iframe", "embed"]);
    $("*").each((i, element) => {
      const { tagName } = element;
      if (disallowedTagNames.has(tagName)) {
        throw new Error(`${filePath} contains a <${tagName}> tag`);
      }
      for (const key in element.attribs) {
        if (/(\\x[a-f0-9]{2}|\b)on\w+/.test(key)) {
          throw new Error(
            `${filePath} <${tagName}> contains an unsafe attribute: '${key}'`
          );
        }
      }
    });
  } else {
    // Check that the file extension matches the file header.
    const fileType = await FileType.fromFile(filePath);
    if (!fileType) {
      // This can easily happen if the .png (for example) file is actually just
      // a text file and not a binary.
      throw new Error(
        `${filePath} file-type could not be extracted at all ` +
          `(probably not a ${path.extname(filePath)} file)`
      );
    }
    if (!VALID_MIME_TYPES.has(fileType.mime)) {
      throw new Error(
        `${filePath} has an unrecognized mime type: ${fileType.mime}`
      );
    } else if (
      path.extname(filePath).replace(".jpeg", ".jpg").slice(1) !== fileType.ext
    ) {
      // If the file is a 'image/png' but called '.jpe?g', that's wrong.
      throw new Error(
        `${filePath} is type '${
          fileType.mime
        }' but named extension is '${path.extname(filePath)}'`
      );
    }
  }

  // The image has to be mentioned in the adjacent index.html document
  const htmlFilePath = path.join(path.dirname(filePath), "index.html");
  if (!fs.existsSync(htmlFilePath)) {
    throw new Error(
      `${filePath} is not located in a folder with an 'index.html' file.`
    );
  }

  // The image must be mentioned (as a string) in the 'index.html' file.
  // Note that it might not be in a <img src> attribute but it could be
  // used in a code example. Either way, it needs to be mentioned by
  // name at least once.
  // Yes, this is pretty easy to fake if you really wanted to, but why
  // bother?
  const html = fs.readFileSync(htmlFilePath, "utf-8");
  if (!html.includes(path.basename(filePath))) {
    throw new Error(`${filePath} is not mentioned in ${htmlFilePath}`);
  }

  const tempdir = tempy.directory();
  const extension = path.extname(filePath).toLowerCase();
  try {
    const plugins = [];
    if (extension === ".jpg" || extension === ".jpeg") {
      plugins.push(imageminMozjpeg());
    } else if (extension === ".png") {
      plugins.push(imageminPngquant());
    } else if (extension === ".gif") {
      plugins.push(imageminGifsicle());
    } else if (extension === ".svg") {
      plugins.push(imageminSvgo());
    } else {
      throw new Error(`No plugin for ${extension}`);
    }
    const files = await imagemin([filePath], {
      destination: tempdir,
      plugins,
      // Needed because otherwise start trying to find files using
      // `globby()` which chokes on file paths that contain brackets.
      // E.g. `/web/css/transform-function/rotate3d()/transform.png`
      // Setting this to false tells imagemin() to just accept what
      // it's given instead of trying to search for the image.
      glob: false,
    });
    if (!files.length) {
      throw new Error(`${filePath} could not be compressed`);
    }
    const compressed = files[0];
    const sizeBefore = fs.statSync(filePath).size;
    const sizeAfter = fs.statSync(compressed.destinationPath).size;
    const reductionPercentage = 100 - (100 * sizeAfter) / sizeBefore;

    if (reductionPercentage > MAX_COMPRESSION_DIFFERENCE_PERCENTAGE) {
      if (options.saveCompression) {
        console.log(
          `Compressed ${filePath}. New file is ${reductionPercentage.toFixed(
            0
          )}% smaller.`
        );
        fse.copyFileSync(compressed.destinationPath, filePath);
      } else {
        const msg = `${filePath} is ${formatSize(
          sizeBefore
        )} can be compressed to ${formatSize(
          sizeAfter
        )} (${reductionPercentage.toFixed(0)}%)`;
        console.warn(msg);
        console.log(
          "Consider running again with '--save-compression' and run again " +
            "to automatically save the newly compressed file."
        );
        const relPath =
          process.env.CI === "true"
            ? path.relative(process.cwd(), filePath)
            : filePath;
        const cliCommand = `yarn filecheck "${relPath}" --save-compression`;
        console.log(`HINT! Type the following command:\n\n\t${cliCommand}\n`);
        throw new Error(
          `${filePath} can be compressed by ~${reductionPercentage.toFixed(0)}%`
        );
      }
    }
  } catch (error) {
    fse.removeSync(tempdir);
    console.error(error);
    throw error;
  }
}

async function runChecker(files, options) {
  return Promise.all(files.map((f) => checkFile(f, options)));
}

module.exports = { runChecker, checkFile };
