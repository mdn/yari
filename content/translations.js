const Document = require("./document");
const { VALID_LOCALES } = require("./constants");
const LANGUAGES_RAW = require("./languages.json");

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

const TRANSLATIONS_OF = new Map();

function gatherTranslations() {
  const iter = Document.findAll().iter();
  for (const {
    metadata: { slug, locale, title },
  } of iter) {
    const translation = {
      title,
      locale,
      native: LANGUAGES.get(locale.toLowerCase()).native,
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
    const label = "Time to gather all translations";
    console.time(label);
    gatherTranslations();
    console.timeEnd(label);
  }
  const translations = TRANSLATIONS_OF.get(slug.toLowerCase());
  if (translations && currentLocale) {
    return translations.filter(
      ({ locale }) => locale.toLowerCase() !== currentLocale.toLowerCase()
    );
  }
  return translations;
}

function findDocumentTranslations(document) {
  const translations = [];

  for (const locale of VALID_LOCALES.values()) {
    if (document.metadata.locale === locale) {
      continue;
    }
    const translatedDocumentURL = document.url.replace(
      `/${document.metadata.locale}/`,
      `/${locale}/`
    );
    const translatedDocument = Document.findByURL(translatedDocumentURL);
    if (translatedDocument) {
      translations.push({
        locale,
        title: translatedDocument.metadata.title,
        native: LANGUAGES.get(locale.toLowerCase()).native,
      });
    }
  }
  return translations;
}

module.exports = {
  translationsOf,
  findDocumentTranslations,
};
