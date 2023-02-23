import cld from "cld";

// This checks that a document is in the correct language. This ensures that
// we don't have untranslated or partially translated documents within the
// translated-content repo, or that any documents in the content repo are
// not English.
//
// For example, if a document in the Spanish locale is mostly in English,
// this will throw a flaw warning that the content is in an incorrect
// language.

// Minimum threshold before throwing flaw
const THRESHOLD = 10;

const IGNORE_BLOCK_STRINGS = [
  "<!-- lang-detect ignore-start -->",
  "<!-- lang-detect ignore-end -->",
];

const IGNORED_LANGUAGES = [
  "LATIN", // Commonly used as example text
];

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function getLocaleName(locale) {
  const strippedLocale = locale.split("-")[0];
  // XXX Remove "any" cast one https://github.com/dachev/node-cld/pull/75 lands
  return getKeyByValue((cld as any).LANGUAGES, strippedLocale);
}

function removeIgnoredSections(content) {
  let newContent = content;
  let complete = false;

  while (!complete) {
    const posStart = content.search(IGNORE_BLOCK_STRINGS[0]);
    const posEnd = content.search(IGNORE_BLOCK_STRINGS[1]);

    if (posStart === -1 || posEnd === -1) {
      // If there isn't a full lang-detect ignore block left, we're finished
      complete = true;
    } else {
      newContent = newContent.replace(
        newContent.slice(posStart, posEnd + IGNORE_BLOCK_STRINGS[1].length),
        ""
      );
    }
  }

  return newContent;
}

export async function getDocumentLanguageFlaws(doc, $, document) {
  const expectedLocale = getLocaleName(document.metadata.locale);
  const content = removeIgnoredSections($.html());

  let detection;
  try {
    detection = await cld.detect(content, {
      isHTML: true,
      languageHint: expectedLocale,
    });
  } catch (e) {
    if ((e as Error).message === "Failed to identify language") {
      // If the language couldn't be identified, silently ignore
      return [];
    }

    throw e;
  }

  const detectedLocales = detection.languages
    .filter((l) => !IGNORED_LANGUAGES.includes(l.name))
    .filter((l) => l.percent > THRESHOLD);

  if (
    detectedLocales.length === 1 &&
    detectedLocales[0].name === expectedLocale
  ) {
    // The only language that was detected was the one we expected
    return [];
  }

  // We detected one or more incorrect languages
  return [
    {
      id: "wrong_language",
      explanation: `Expected only ${expectedLocale}, but found: ${detection.languages
        .map(
          (l) =>
            `${l.name} (${l.percent}%${
              IGNORED_LANGUAGES.includes(l.name) ? ", ignored" : ""
            })`
        )
        .join(", ")}`,
      suggestion:
        (expectedLocale === "ENGLISH"
          ? "This file seems to have been accidentally translated and may need to be reverted or rewritten."
          : "This file may be partially/fully untranslated and may need to be removed or translated.") +
        '\n\nFor sections that are supposed to be in another language, surround the block of content with "<!-- lang-detect ignore-start -->" and "<!-- lang-detect ignore-end -->".',
    },
  ];
}
