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

const cacheContentFeatures = new LRU({ max: 2000 });

function getContentFeatures(rawContent, cacheKey = null) {
  if (cacheKey && cacheContentFeatures.has(cacheKey)) {
    return cacheContentFeatures.get(cacheKey);
  }
  const features = new Map();
  const $ = cheerio.load(rawContent);
  $("h2, h3, p").each((i, element) => {
    const { tagName } = element;
    if (!features.has(tagName)) {
      features.set(tagName, new Set());
    }
    const text = $(element).text().trim();
    if (text.startsWith("{{") && text.endsWith("}}")) {
      // E.g. `{{NextMenu("Learn/Forms/How_to_structure_a_web_form", "Learn/Forms")}}`
      // These are too hard to compare and just too weird. So for now, just skip them.
      return;
    }
    if (text) {
      features.get(tagName).add(text);
    }
  });
  if (cacheKey) {
    cacheContentFeatures.set(cacheKey, features);
  }
  return features;
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
    englishDocument.url
  );
  for (const [macro, macroName] of IMPORTANT_MACROS) {
    const macrosEnglish = englishMacros.get(macro) || [];
    // const countEnglish = macrosEnglish.length;
    const macrosTranslation = translatedMacros.get(macro) || [];
    // const countTranslation = macrosTranslation.length;
    if (macrosEnglish.length !== macrosTranslation.length) {
      // Independent of the arguments, the *presence* of important macros is different.
      const fullExplanation = [];
      yield {
        type: "macro",
        name: macroName,
        // XXX Might be nice to make this a bit more "human".
        // For example, a lot of times this becomes:
        //    EmbedInteractiveExample macro: en-US has 1, zh-CN has 0
        // which is a bit cryptic.
        explanation: `en-US has ${macrosEnglish.length}, ${translatedDocument.metadata.locale} has ${macrosTranslation.length}`,
        fullExplanation,
      };
    } else if (macrosEnglish.length > 0) {
      // XXX compare arguments?
    }
  }

  // Compare possibly untranslated remaining English paragraphs, h2, and h3s.
  const translatedContentFeatures = getContentFeatures(
    translatedDocument.rawContent
  );
  const englishContentFeatures = getContentFeatures(
    englishDocument.rawContent,
    englishDocument.url
  );
  for (const tagName of ["h2", "h3", "p"]) {
    const translatedFeatures =
      translatedContentFeatures.get(tagName) || new Set();
    const englishFeatures = englishContentFeatures.get(tagName) || new Set();
    const intersection = new Set(
      [...translatedFeatures].filter((x) => englishFeatures.has(x))
    );
    const union = new Set([...translatedFeatures, ...englishFeatures]);
    const remainingParagraphsPercentage =
      (100 * intersection.size) / union.size;
    if (remainingParagraphsPercentage > 0) {
      console.warn(`http://localhost:3000${translatedDocument.url}`);
      const fullExplanation = [];
      for (const thing of intersection) {
        fullExplanation.push(
          `<${tagName}>${
            thing.length > 40 ? thing.slice(0, 40) + "…" : thing
          }</${tagName}>`
        );
      }
      yield {
        type: "stillenglish",
        name: "Untranslated remaining English content features",
        explanation: `${intersection.size} identical <${tagName}> in English translations`,
        fullExplanation,
      };
    }
  }
}

module.exports = {
  getTranslationDifferences,
};
