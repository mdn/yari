/* eslint-disable node/no-missing-require */
const { VALID_LOCALES } = require("@yari-internal/constants");

const LOCALES = [...VALID_LOCALES.keys()];

// Map of locale to bitwise flag.
const LOCALE_MASK = new Map(
  [...LOCALES.entries()].map(([index, locale]) => [locale, 1 << index])
);

module.exports = {
  LOCALE_MASK,
};
