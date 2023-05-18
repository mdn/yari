import * as Document from "./document.js";
import { VALID_LOCALES } from "../libs/constants/index.js";
import LANGUAGES_RAW from "../libs/languages/index.js";

const LANGUAGES = new Map(
  Object.entries(LANGUAGES_RAW).map(([locale, data]) => {
    return [locale.toLowerCase(), data];
  })
);

const TRANSLATIONS_OF = new Map();

async function gatherTranslations() {
  const iter = (await Document.findAll()).iterDocs();
  for (const {
    metadata: { slug, locale, title },
  } of iter) {
    if (!slug || !locale || !title) {
      continue;
    }
    const translation = {
      title,
      locale,
      native: LANGUAGES.get(locale.toLowerCase()).native,
    };
    const translations = TRANSLATIONS_OF.get(slug.toLowerCase());
    if (translations) {
      translations.push(translation);
      translations.sort(({ locale: a }, { locale: b }) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });
    } else {
      TRANSLATIONS_OF.set(slug.toLowerCase(), [translation]);
    }
  }
}

export async function translationsOf({ slug, locale: currentLocale }) {
  if (TRANSLATIONS_OF.size === 0) {
    const label = "Time to gather all translations";
    console.time(label);
    await gatherTranslations();
    console.timeEnd(label);
  }
  const translations = TRANSLATIONS_OF.get(slug.toLowerCase());
  if (translations && currentLocale) {
    return translations.filter(
      ({ locale }) => locale.toLowerCase() !== currentLocale.toLowerCase()
    );
  }
  return translations;
}

export function findDocumentTranslations(document) {
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
        native: LANGUAGES.get(locale.toLowerCase()).native,
      });
    }
  }
  return translations;
}
