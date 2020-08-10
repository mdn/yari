const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const { MAX_FILE_SIZE } = require("./constants");

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
}

async function runChecker(files, options) {
  // console.log("OPTIONS", options);
  // console.log("FILES", files);
  return Promise.all(files.map(checkFile));
}

module.exports = { runChecker, checkFile };
