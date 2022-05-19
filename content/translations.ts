// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
const { VALID_LOCALES } = require("./constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'LANGUAGES_... Remove this comment to see the full error message
const LANGUAGES_RAW = require("./languages.json");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'LANGUAGES'... Remove this comment to see the full error message
const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

const TRANSLATIONS_OF = new Map();

function gatherTranslations() {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
  const iter = Document.findAll().iter();
  for (const {
    metadata: { slug, locale, title },
  } of iter) {
    if (!slug || !locale || !title) {
      continue;
    }
    const translation = {
      title,
      locale,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'native' does not exist on type 'unknown'... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'translatio... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'findDocume... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findByURL' does not exist on type '{ new... Remove this comment to see the full error message
    const translatedDocument = Document.findByURL(translatedDocumentURL);
    if (translatedDocument) {
      translations.push({
        locale,
        title: translatedDocument.metadata.title,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'native' does not exist on type 'unknown'... Remove this comment to see the full error message
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
