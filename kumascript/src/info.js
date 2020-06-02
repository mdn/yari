// PETERBE HERE!
BASE_URL = "https://developer.mozilla.org";

class AllPagesInfo {
  constructor(pageInfoByUri, uriTransform) {
    // This constructor requires a "pageInfoByUri" Map object (for example,
    // "allTitles"), and a "uriTransform" function for cleaning/repairing
    // URI's provided as arguments to the macros.
    //
    // NOTE: Assumes all of the keys of "pageInfoByUri" are lowercase.
    this.resultCache = new Map();
    this.uriTransform = uriTransform;

    // Using the provided "pageInfoByUri" map, build the data structures
    // needed to efficiently provide data suitable for consumption by
    // the Kumascript macros.

    const pagesByUri = new Map();
    const childrenByUri = new Map();

    // We'll build "pagesByUri" first, and then populate the "childrenByUri"
    // object it references.

    function buildTranslationObjects(data) {
      // Builds a list of translation objects suitable for
      // consumption by Kumascript macros, using the translation
      // information from the given "data" as well as the "pageInfoByUri".
      const result = [];
      let rawTranslations = data.translations || [];
      if (!rawTranslations.length && data.translation_of) {
        const englishUri = `/en-US/docs/${data.translation_of}`;
        const englishData = pageInfoByUri.get(englishUri.toLowerCase());
        if (englishData) {
          // First, add the English translation for this non-English locale.
          result.push(
            Object.freeze({
              url: englishUri,
              locale: "en-US",
              title: englishData.title,
              summary: englishData.summary,
            })
          );
          rawTranslations = englishData.translations || [];
        }
      }
      for (const { locale, slug } of rawTranslations) {
        if (locale !== data.locale) {
          // A locale is never a translation of itself.
          const uri = `/${locale}/docs/${slug}`;
          const pageData = pageInfoByUri.get(uri.toLowerCase());
          result.push(
            Object.freeze({
              url: uri,
              locale: locale,
              title: pageData.title,
              summary: pageData.summary,
            })
          );
        }
      }
      return result;
    }

    // Assumes
    for (const [uri, data] of pageInfoByUri) {
      pagesByUri.set(
        uri,
        Object.freeze({
          url: data.mdn_url,
          locale: data.locale,
          slug: data.slug,
          title: data.title,
          summary: data.summary,
          tags: Object.freeze(data.tags || []),
          translations: Object.freeze(buildTranslationObjects(data)),
          get subpages() {
            // Let's make this "subpages" property lazy, i.e. we'll only
            // generate its value on demand. Most of the macros don't even
            // use this property, so don't waste any time and memory until
            // it's actually requested. IMPORTANT: The list returned does
            // not need to be frozen since it's re-created for each caller
            // (so one caller can't mess with another), but also should NOT
            // be frozen since some macros sort the list in-place.
            return (
              childrenByUri.get(this.url.toLowerCase()) || []
            ).map((childUriKey) => pagesByUri.get(childUriKey));
          },
        })
      );
    }

    this.pagesByUri = Object.freeze(pagesByUri);

    // Now let's populate "childrenByUri", a mapping of URI's to their
    // immediate children. This is only used (referenced) within the
    // lazy "subpages" getter of each page object within "pagesByUri".

    const alreadyProcessed = new Set();
    function addChild(childUri, locale, slugSegments) {
      // Recursive function that adds each possible child
      // URI of this incoming URI to its parent. The number
      // of segments in the largest document URI is on the
      // order of 10, so recursion is safe here.
      if (alreadyProcessed.has(childUri)) {
        return;
      }
      alreadyProcessed.add(childUri);
      slugSegments.pop();
      const parentUri = `/${locale}/docs/${slugSegments.join("/")}`;
      if (pagesByUri.has(childUri)) {
        // This URI is an actual document, so add it as a child of
        // its parent URI.
        if (childrenByUri.has(parentUri)) {
          childrenByUri.get(parentUri).push(childUri);
        } else {
          childrenByUri.set(parentUri, [childUri]);
        }
      }
      if (slugSegments.length > 1) {
        addChild(parentUri, locale, slugSegments);
      }
    }

    // Build "childrenByUri", a map of every possible parent URI
    // to its list of actual child document URI's.
    for (const uri of pagesByUri.keys()) {
      const [locale, ...slugSegments] = uri
        .replace("/docs/", " ")
        .replace(/\//g, " ")
        .trim()
        .split(" ");
      addChild(uri, locale, slugSegments);
    }
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
    const uriKey = this.getUriKey(url);
    if (!this.pagesByUri.has(uriKey)) {
      throw new Error(`${this.getDescription(url)} does not exist`);
    }
    const pageData = this.pagesByUri.get(uriKey);
    if (includeSelf) {
      return [pageData];
    }
    return pageData.subpages;
  }

  getTranslations(url) {
    const uriKey = this.getUriKey(url);
    if (!this.pagesByUri.has(uriKey)) {
      throw new Error(`${this.getDescription(url)} does not exist`);
    }
    return this.pagesByUri.get(uriKey).translations;
  }

  getPage(url) {
    const uriKey = this.getUriKey(url);
    if (!this.pagesByUri.has(uriKey)) {
      throw new Error(`${this.getDescription(url)} does not exist`);
    }
    return this.pagesByUri.get(uriKey);
  }

  cacheResult(uri, result) {
    const uriKey = this.getUriKey(uri);
    this.resultCache.set(uriKey, result);
  }

  getResultFromCache(uri) {
    const uriKey = this.getUriKey(uri);
    return this.resultCache.get(uriKey);
  }

  clearCache() {
    this.resultCache.clear();
  }
}

module.exports = AllPagesInfo;
