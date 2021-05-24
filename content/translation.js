const LRU = require("lru-cache");

const Parser = require("../kumascript/src/parser.js");

const cacheKSMacros = new LRU({ max: 2000 });

const IMPORTANT_MACROS = new Map(
  [
    "APIRef",
    "AddonSidebar",
    "AddonSidebarMain",
    "AvailableInWorkers",
    "CSSRef",
    "CSSSyntax",
    "CanvasSidebar",
    "Compat",
    "DefaultAPISidebar",
    "EmbedGHLiveSample",
    "EmbedInteractiveExample",
    "EmbedLiveSample",
    "GamesSidebar",
    "HTMLSidebar",
    "HTTPSidebar",
    "IncludeSubnav",
    "JsSidebar",
    "LearnSidebar",
    "MDNSidebar",
    "SVGRef",
    "SeeCompatTable",
    "ServiceWorkerSidebar",
    "Specifications",
    "ToolsSidebar",
    "WebAssemblySidebar",
    "WebExtAPISidebar",
    "WebGLSidebar",
    "WebRTCSidebar",
    "languages",
  ].map((name) => [name.toLowerCase(), name])
);

function getKSMacros(content, cacheKey = null) {
  if (cacheKey && cacheKSMacros.has(cacheKey)) {
    return cacheKSMacros.get(cacheKey);
  }

  const tokens = Parser.parse(content);
  const macros = new Set();

  for (const token of tokens) {
    if (token.type !== "MACRO") {
      continue;
    }
    const macroName = token.name.toLowerCase();
    if (!IMPORTANT_MACROS.has(macroName)) {
      continue;
    }
    const macroArgs = token.args;
    let string = IMPORTANT_MACROS.get(macroName);
    if (macroArgs.length) {
      string += `(${macroArgs
        .map((x) => {
          if (typeof x === "object") {
            return JSON.stringify(x);
          }
          return `'${x}'`;
        })
        .join(", ")})`;
    }
    macros.add(string);
  }

  if (cacheKey) {
    cacheKSMacros.set(cacheKey, macros);
  }
  return macros;
}

function* getTranslationDifferences(englishDocument, translatedDocument) {
  // Compare key KS macros presence
  const translatedMacros = getKSMacros(translatedDocument.rawBody);
  const englishMacros = getKSMacros(
    englishDocument.rawBody,
    englishDocument.url
  );
  if (!equalSets(translatedMacros, englishMacros)) {
    const inCommon = setIntersection(translatedMacros, englishMacros);
    const union = setUnion(translatedMacros, englishMacros);
    // Turn it into an array so it can be sorted.
    // It's good that it's sorted so the outcomes are predictable.
    const differenceArray = [
      ...symmetricSetDifference(translatedMacros, englishMacros),
    ].sort();
    const explanationNotes = differenceArray.map((macroSignature) => {
      if (!englishMacros.has(macroSignature)) {
        return `${macroSignature} only in ${translatedDocument.metadata.locale}`;
      } else {
        return `${macroSignature} only in en-US`;
      }
    });
    yield {
      type: "macro",
      explanation: `Differences in the important macros (${inCommon.size} in common of ${union.size} possible)`,
      explanationNotes,
    };
  }
}

function equalSets(setA, setB) {
  return setA.size === setB.size && [...setA].every((value) => setB.has(value));
}

// Given [1, 2, 3] and [2, 3, 4] the symmetric difference is [1, 4]
function symmetricSetDifference(setA, setB) {
  const difference = new Set(setA);
  for (const elem of setB) {
    if (difference.has(elem)) {
      difference.delete(elem);
    } else {
      difference.add(elem);
    }
  }
  return difference;
}

function setIntersection(setA, setB) {
  const intersection = new Set();
  for (const elem of setB) {
    if (setA.has(elem)) {
      intersection.add(elem);
    }
  }
  return intersection;
}

function setUnion(setA, setB) {
  const union = new Set(setA);
  for (const elem of setB) {
    union.add(elem);
  }
  return union;
}

module.exports = {
  getTranslationDifferences,
};
