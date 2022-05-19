// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const { Document, Translation } = require("../../content");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'DEFAULT_LO... Remove this comment to see the full error message
const { DEFAULT_LOCALE } = require("../../libs/constants");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'injectTran... Remove this comment to see the full error message
function injectTranslationDifferences(doc, $, document) {
  const flaws = [];

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'read' does not exist on type '{ new (): ... Remove this comment to see the full error message
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
