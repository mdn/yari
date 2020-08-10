const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const FileType = require("file-type");

const { MAX_FILE_SIZE } = require("./constants");

const VALID_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg", // this is what you get for .jpeg *and* .jpg file extensions
  "image/gif",
]);

async function checkFile(filePath) {
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
      stats.size > 1024 * 1024
        ? `${(stat.size / 1024.0 / 1024).toFixed(1)}MB`
        : `${(stat.size / 1024.0).toFixed(1)}KB`;
    const formattedMax = `${(MAX_FILE_SIZE / 1024.0 / 1024).toFixed(1)}MB`;
    throw new Error(
      `${filePath} is too large (${formatted} > ${formattedMax})`
    );
  }

  // Check that the file extension matches the file header.
  const fileType = await FileType.fromFile(filePath);
  console.log(filePath, { extname: path.extname(filePath) }, fileType);
  if (!fileType) {
    // This can easily happen if the .png (for example) file is actually just
    // a text file and not a binary.
    throw new Error(
      `${filePath} file-type could not be extracted at all ` +
        `(probably not a ${path.extname(filePath)} file)`
    );
  } else if (
    fileType.mime === "application/xml" &&
    path.extname(filePath) === ".svg"
  ) {
    console.warn("NEED TO CHECK .SVG FOR SCRIPT TAGS");
  } else if (!VALID_MIME_TYPES.has(fileType.mime)) {
    throw new Error(
      `${filePath} has an unrecognized mime type: ${fileType.mime}`
    );
  }
}

async function runChecker(files, options) {
  // console.log("OPTIONS", options);
  // console.log("FILES", files);
  return Promise.all(files.map(checkFile));
}

module.exports = { runChecker, checkFile };
