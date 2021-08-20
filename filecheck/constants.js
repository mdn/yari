export const MAX_FILE_SIZE = JSON.parse(
  process.env.FILECHECK_MAX_FILE_SIZE || 1024 * 1024 * 100 // ~100MiB
);

export const VALID_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg", // this is what you get for .jpeg *and* .jpg file extensions
  "image/gif",
]);

export const MAX_COMPRESSION_DIFFERENCE_PERCENTAGE = 25; // percent
