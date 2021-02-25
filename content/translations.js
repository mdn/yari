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
      translations.sort(({ locale: a }, { locale: b }) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
    } else {
      TRANSLATIONS_OF.set(slug.toLowerCase(), [translation]);
    }
  }
}

function translationsOf({ slug, locale: currentLocale }) {
  if (TRANSLATIONS_OF.size === 0) {
    gatherTranslations();
  }
  const translations = TRANSLATIONS_OF.get(slug.toLowerCase());
  if (translations && currentLocale) {
    return translations.filter(
      ({ locale }) => locale.toLowerCase() !== currentLocale.toLowerCase()
    );
  }
  return translations;
}

module.exports = {
  translationsOf,
};
