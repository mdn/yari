const MAX_FILE_SIZE = JSON.parse(
  process.env.FILECHECK_MAX_FILE_SIZE || 1024 * 1024 * 100 // ~100MiB
);

module.exports = {
  MAX_FILE_SIZE,
};
