const { findAll } = require("./document");

const TRANSLATIONS_OF = new Map();

function gatherTranslations() {
  const iter = findAll().iter();
  for (const {
    metadata: { slug, locale, title },
    url,
  } of iter) {
    const translation = {
      title,
      url,
      locale,
    };
    const translations = TRANSLATIONS_OF.get(slug.toLowerCase());
    if (translations) {
      translations.push(translation);
    } else {
      TRANSLATIONS_OF.set(slug.toLowerCase(), [translation]);
    }
  }
}

function translationsOf(slug) {
  if (TRANSLATIONS_OF.size === 0) {
    gatherTranslations();
  }
  return TRANSLATIONS_OF.get(slug.toLowerCase());
}

module.exports = {
  translationsOf,
};
