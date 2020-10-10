const fs = require("fs");

const Parser = require("../kumascript/src/parser.js");
const { normalizeMacroName } = require("../kumascript/src/render.js");
const buildOptions = require("../build/build-options");

async function analyzeDocument(document) {
  const { metadata } = document;

  const doc = {
    ...metadata,
    isArchive: !!document.isArchive,
    isTranslated: !!document.isTranslated,
  };

  doc.flaws = {};

  doc.normalizedMacrosCount = {};
  const tokens = Parser.parse(document.rawHTML);
  for (let token of tokens) {
    if (token.type === "MACRO") {
      const normalizedMacroName = normalizeMacroName(token.name);
      if (!(normalizedMacroName in doc.normalizedMacrosCount)) {
        doc.normalizedMacrosCount[normalizedMacroName] = 0;
      }
      doc.normalizedMacrosCount[normalizedMacroName]++;
    }
  }
  doc.tags = document.metadata.tags || [];

  doc.fileSize = fs.statSync(document.fileInfo.path).size;
  doc.title = metadata.title;
  doc.mdn_url = document.url;
  // Check and scrutinize any local image references

  // If the document has a `.popularity` make sure don't bother with too
  // many significant figures on it.
  doc.popularity = metadata.popularity
    ? Number(metadata.popularity.toFixed(4))
    : 0.0;

  doc.modified = metadata.modified || null;

  const otherTranslations = document.translations || [];
  if (!otherTranslations.length && metadata.translation_of) {
    // If built just-in-time, we won't have a record of all the other translations
    // available. But if the current document has a translation_of, we can
    // at least use that.
    otherTranslations.push({ locale: "en-US", slug: metadata.translation_of });
  }

  if (otherTranslations.length) {
    doc.other_translations = otherTranslations;
  }

  return doc;
}

module.exports = {
  analyzeDocument,

  options: buildOptions,
};
