const { Document } = require("../content");
const { VALID_LOCALES } = require("../libs/constants");

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
        url: translatedDocument.url,
      });
    }
  }
  return translations;
}

module.exports = { findDocumentTranslations };
