const { runChecker, checkFile } = require("./checker");
const {
  MAX_FILE_SIZE,
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
} = require("./constants");

module.exports = {
  runChecker,
  checkFile,
  MAX_FILE_SIZE,
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
};
