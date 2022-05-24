const MAX_FILE_SIZE = JSON.parse(
  process.env.FILECHECK_MAX_FILE_SIZE || 1024 * 1024 * 100 // ~100MiB
);

const VALID_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg", // this is what you get for .jpeg *and* .jpg file extensions
  "image/gif",
]);

const MAX_COMPRESSION_DIFFERENCE_PERCENTAGE = 25; // percent

module.exports = {
  MAX_FILE_SIZE,
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
};
