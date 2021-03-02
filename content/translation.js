const cheerio = require("cheerio");
const LRU = require("lru-cache");

const Parser = require("../kumascript/src/parser.js");

const cacheKSMacros = new LRU({ max: 2000 });

function getKSMacros(rawContent, cacheKey = null) {
  if (cacheKey && cacheKSMacros.has(cacheKey)) {
    return cacheKSMacros.get(cacheKey);
  }

  const tokens = Parser.parse(rawContent);
  const macros = new Map();

  for (const token of tokens) {
    if (token.type !== "MACRO") {
      continue;
    }
    const macroName = token.name.toLowerCase();
    const macroArgs = token.args;
    const before = macros.get(macroName) || [];
    before.push(macroArgs);
    macros.set(macroName, before);
  }

  if (cacheKey) {
    cacheKSMacros.set(cacheKey, macros);
  }
  return macros;
}

const cacheParagraphs = new LRU({ max: 2000 });

function getParagraphs(rawContent, cacheKey = null) {
  if (cacheKey && cacheParagraphs.has(cacheKey)) {
    return cacheParagraphs.get(cacheKey);
  }
  const paragraphs = new Set();
  const $ = cheerio.load(rawContent);
  $("p").each((i, paragraph) => {
    const text = $(paragraph).text().trim();
    if (text.startsWith("{{") && text.endsWith("}}")) {
      // E.g. `{{NextMenu("Learn/Forms/How_to_structure_a_web_form", "Learn/Forms")}}`
      return;
    }
    if (text) {
      paragraphs.add(text);
    }
  });
  return paragraphs;
}

const IMPORTANT_MACROS = new Map(
  [
    "Compat",
    "EmbedInteractiveExample",
    "EmbedLiveSample",
    "EmbedGHLiveSample",
    "CSSSyntax",
    // XXX List all the important sidebar macros??
  ].map((name) => [name.toLowerCase(), name])
);

function* getTranslationDifferences(englishDocument, translatedDocument) {
  // Compare key KS macros presence
  const translatedMacros = getKSMacros(translatedDocument.rawContent);
  const englishMacros = getKSMacros(
    englishDocument.rawContent,
    englishDocument.mdn_url
  );
  for (const [macro, macroName] of IMPORTANT_MACROS) {
    const macrosEnglish = englishMacros.get(macro) || [];
    // const countEnglish = macrosEnglish.length;
    const macrosTranslation = translatedMacros.get(macro) || [];
    // const countTranslation = macrosTranslation.length;
    if (macrosEnglish.length !== macrosTranslation.length) {
      // Independent of the arguments, the *presence* of important macros is different.
      yield {
        type: "macro",
        name: macroName,
        explanation: `en-US has ${macrosEnglish.length}, ${translatedDocument.metadata.locale} has ${macrosTranslation.length}`,
      };
    } else if (macrosEnglish.length > 0) {
      // XXX compare arguments?
    }
  }

  // Compare possibly untranslated remaining English paragraphs
  // XXX instead of just counting paragraphs, perhaps compare the <p>, <h2> and <h3>
  const translatedParagraphs = getParagraphs(translatedDocument.rawContent);
  const englishParagraphs = getParagraphs(
    englishDocument.rawContent,
    englishDocument.mdn_url
  );
  const intersection = new Set(
    [...translatedParagraphs].filter((x) => englishParagraphs.has(x))
  );
  const union = new Set([...translatedParagraphs, ...englishParagraphs]);
  const remainingParagraphsPercentage = (100 * intersection.size) / union.size;
  if (remainingParagraphsPercentage > 0) {
    yield {
      type: "stillenglish",
      name: "Untranslated remaining English paragraphs",
      explanation: `${intersection.size} paragraphs identical in English translations`,
    };
  }
}

module.exports = {
  getTranslationDifferences,
};
