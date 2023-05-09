import * as Document from "./document.js";
import { VALID_LOCALES } from "../libs/constants/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

type Translation = {
  locale: string;
  title: string;
  native: string;
};

const TRANSLATIONS_OF = new Map<string, Array<Translation>>();

// return all translations of a document
export function findTranslations(
  slug: string,
  currentLocale: string = null
): Array<Translation> {
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

// gather and cache all translations of a document,
// then return all translations except the current locale
export function translationsOf(
  slug: string,
  currentLocale: string
): Array<Translation> {
  let documents = TRANSLATIONS_OF.get(slug.toLowerCase());
  if (!documents) {
    documents = findTranslations(slug);
    TRANSLATIONS_OF.set(slug.toLowerCase(), documents);
  }
  return (
    documents.filter(
      ({ locale }) => locale.toLowerCase() !== currentLocale.toLowerCase()
    ) ?? []
  );
}
