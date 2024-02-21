import * as Document from "./document.js";
import { VALID_LOCALES } from "../libs/constants/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

export type Translation = {
  locale: string;
  title: string;
  native: string;
};

const TRANSLATIONS_OF = new Map<string, Array<Translation>>();

// gather and cache all translations of a document,
// then return all translations except the current locale
export function translationsOf(
  slug: string,
  currentLocale: string
): Translation[] {
  let translations = TRANSLATIONS_OF.get(slug.toLowerCase());
  if (!translations) {
    translations = findTranslations(slug);
    TRANSLATIONS_OF.set(slug.toLowerCase(), translations);
  }
  return translations.filter(
    ({ locale }) => locale.toLowerCase() !== currentLocale.toLowerCase()
  );
}

// return all translations of a document
export function findTranslations(
  slug: string,
  currentLocale: string = null
): Translation[] {
  const translations = [];
  for (const locale of VALID_LOCALES.values()) {
    if (currentLocale?.toLowerCase() === locale.toLowerCase()) {
      continue;
    }
    const documentURL = `/${locale}/docs/${slug}`;
    const document = Document.findByURL(documentURL);
    if (document) {
      translations.push({
        locale,
        title: document.metadata.title,
        native: LANGUAGES.get(locale.toLowerCase()).native,
      });
    }
  }
  return translations;
}
