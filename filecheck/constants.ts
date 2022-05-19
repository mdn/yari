// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MAX_FILE_S... Remove this comment to see the full error message
const MAX_FILE_SIZE = JSON.parse(
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | number' is not assignab... Remove this comment to see the full error message
  process.env.FILECHECK_MAX_FILE_SIZE || 1024 * 1024 * 100 // ~100MiB
);

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_MIME... Remove this comment to see the full error message
const VALID_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg", // this is what you get for .jpeg *and* .jpg file extensions
  "image/gif",
]);

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MAX_COMPRE... Remove this comment to see the full error message
const MAX_COMPRESSION_DIFFERENCE_PERCENTAGE = 25; // percent

module.exports = {
  MAX_FILE_SIZE,
  VALID_MIME_TYPES,
  MAX_COMPRESSION_DIFFERENCE_PERCENTAGE,
};
