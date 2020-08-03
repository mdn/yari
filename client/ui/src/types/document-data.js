export type DocumentData = {
  locale: string,
  slug: string,
  enSlug: string, // For non-english documents, the original english slug
  id: number,
  title: string,
  summary: string,
  language: string,
  hrefLang: string,
  absoluteURL: string,
  wikiURL: string,
  editURL: string,
  translateURL: string | null,
  translationStatus: null | "in-progress" | "outdated",
  bodyHTML: string,
  quickLinksHTML: string,
  tocHTML: string,
  parents: Array<{ url: string, title: string }>,
  translations: Array<{
    locale: string,
    language: string,
    hrefLang: string,
    localizedLanguage: string,
    url: string,
    title: string
  }>,
  lastModified: string // An ISO date
};
