const { Document, Translation } = require("../../content");
const { DEFAULT_LOCALE } = require("../../libs/constants");

function injectTranslationDifferences(doc, $, document) {
  const flaws = [];

  const englishDocument = Document.read(
    document.fileInfo.folder.replace(
      document.metadata.locale.toLowerCase(),
      DEFAULT_LOCALE.toLowerCase()
    )
  );
  if (!englishDocument) {
    console.warn(`Can't get English original from ${document.fileInfo.folder}`);
    return [];
  }

  function addFlaw(difference) {
    const id = `translation_differences${flaws.length + 1}`;
    const { explanation } = difference;
    const suggestion = null;
    const fixable = false;
    const flaw = {
      id,
      explanation,
      suggestion,
      fixable,
      difference,
    };
    flaws.push(flaw);
  }

  for (const difference of Translation.getTranslationDifferences(
    englishDocument,
    document
  )) {
    addFlaw(difference);
  }
  return flaws;
}

module.exports = { injectTranslationDifferences };
