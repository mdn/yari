const { DEFAULT_BUILD_ROOT } = require("content/scripts/constants");
const Document = require("content/scripts/document");
const { buildURL } = require("content/scripts/utils");

const BASE_URL = "https://developer.mozilla.org";
const DUMMY_BASE_URL = "https://example.com";

class AllPagesInfo {
  constructor(uriTransform) {
    // This constructor requires a "pageInfoByUri" Map object (for example,
    // "allTitles"), and a "uriTransform" function for cleaning/repairing
    // URI's provided as arguments to the macros.
    //
    // NOTE: Assumes all of the keys of "pageInfoByUri" are lowercase.
    this.uriTransform = uriTransform;
  }

  getPathname(url) {
    // This function returns just the pathname of the given "url", removing
    // any trailing "/".
    return new URL(url, DUMMY_BASE_URL).pathname.replace(/\/$/, "");
  }

  getUriKey(url) {
    // This function returns just the lowercase pathname of the given "url",
    // removing any trailing "/". The BASE_URL is not important here, since
    // we're only after the path of any incoming "url", but it's required by
    // the URL constructor when the incoming "url" is relative.
    const uri = new URL(url, BASE_URL).pathname
      .replace(/\/$/, "")
      .toLowerCase();
    return this.uriTransform(uri);
  }

  getDescription(url) {
    const uriKey = this.getUriKey(url);
    let description = `"${uriKey}"`;
    if (uriKey !== url.toLowerCase()) {
      description += ` (derived from "${url}")`;
    }
    return description;
  }

  getChildren(url, includeSelf) {
    // We don't need "depth" since it's handled dynamically (lazily).
    // The caller can keep requesting "subpages" as deep as the
    // hierarchy goes, and they'll be provided on-demand.
    // IMPORTANT: The list returned does not need to be frozen since
    // it's re-created for each caller (so one caller can't mess with
    // another), but also should NOT be frozen since some macros sort
    // the list in-place.
    const page = this.getPage(url);
    if (includeSelf) {
      return [page];
    }
    return page.subpages;
  }

  // TODO
  getTranslations(url) {
    // function buildTranslationObjects(data) {
    //   // Builds a list of translation objects suitable for
    //   // consumption by Kumascript macros, using the translation
    //   // information from the given "data" as well as the "pageInfoByUri".
    //   const result = [];
    //   let rawTranslations = data.translations || [];
    //   if (!rawTranslations.length && data.translation_of) {
    //     const englishUri = `/en-US/docs/${data.translation_of}`;
    //     const englishData = pageInfoByUri.get(englishUri.toLowerCase());
    //     if (englishData) {
    //       // First, add the English translation for this non-English locale.
    //       result.push(
    //         Object.freeze({
    //           url: englishUri,
    //           locale: "en-US",
    //           title: englishData.title,
    //           summary: englishData.summary,
    //         })
    //       );
    //       rawTranslations = englishData.translations || [];
    //     }
    //   }
    //   for (const { locale, slug } of rawTranslations) {
    //     if (locale !== data.locale) {
    //       // A locale is never a translation of itself.
    //       const uri = `/${locale}/docs/${slug}`;
    //       const pageData = pageInfoByUri.get(uri.toLowerCase());
    //       result.push(
    //         Object.freeze({
    //           url: uri,
    //           locale: locale,
    //           title: pageData.title,
    //           summary: pageData.summary,
    //         })
    //       );
    //     }
    //   }
    //   return result;
    // }

    return [];
  }

  getPage(url) {
    const result = Document.findByURL(url);
    if (!result) {
      throw new Error(`${this.getDescription(url)} does not exist`);
    }

    const self = this;
    const { locale, slug, title, summary, tags } = result.document.metadata;
    return {
      url: buildURL(locale, slug),
      locale,
      slug,
      title,
      summary,
      tags: tags || [],
      translations: [], //TODO Object.freeze(buildTranslationObjects(data)),
      get subpages() {
        return Document.findChildren(url).map((doc) =>
          self.getPage(buildURL(locale, doc.metadata.slug))
        );
      },
    };
  }
}

module.exports = AllPagesInfo;
