const renderMacros = require("./src/render.js");
const Templates = require("./src/templates.js");

BASE_URL = "https://developer.mozilla.org";

function getUriKey(url) {
  // This function returns just the lowercase pathname of the given "url",
  // removing any trailing "/". The BASE_URL is not important here, since
  // we're only after the path of any incoming "url", but it's required by
  // the URL constructor when the incoming "url" is relative.
  return new URL(url, BASE_URL).pathname.replace(/\/$/, "").toLowerCase();
}

class AllPagesInfo {
  constructor(pageInfoByUri) {
    this.pagesByUri = null;
    this.childrenByUri = null;
    this.pageInfoByUri = pageInfoByUri;
  }

  build() {
    // Builds the data structures needed to efficiently provide
    // data suitable for consumption by Kumascript macros.

    if (this.pagesByUri && this.childrenByUri) {
      // No need to do anything if we've already built our
      // data structures.
      return;
    }

    // Using the provided "pageInfoByUri", build a new data structure
    // "pagesByUri" that provides data suitable for consumption by
    // Kumascript macros.
    const pageInfoByUri = this.pageInfoByUri;

    function buildTranslationObjects(data) {
      // Builds a list of translation objects suitable for
      // consumption by Kumascript macros, using the translation
      // information from the given "data" as well as the "pageInfoByUri".
      const result = [];
      let rawTranslations = data.translations || [];
      if (!rawTranslations.length && data.translation_of) {
        const englishUri = `/en-US/docs/${data.translation_of}`;
        const englishData = pageInfoByUri[englishUri];
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
          const pageData = pageInfoByUri[uri];
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

    const pagesByUri = {};
    const childrenByUri = {};

    for (const [uri, data] of Object.entries(pageInfoByUri)) {
      pagesByUri[uri.toLowerCase()] = Object.freeze({
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
          // it's actually requested.
          return Object.freeze(
            (childrenByUri[this.url.toLowerCase()] || []).map(
              (childUriKey) => pagesByUri[childUriKey]
            )
          );
        },
      });
    }
    this.pagesByUri = Object.freeze(pagesByUri);

    // Finally, using the "pagesByUri" we just built, let's populate
    // "childrenByUri", a map of URI's to their immediate child pages.

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
      if (pagesByUri.hasOwnProperty(childUri)) {
        // This URI is an actual document, so add it as a child of
        // its parent URI.
        if (childrenByUri.hasOwnProperty(parentUri)) {
          childrenByUri[parentUri].push(childUri);
        } else {
          childrenByUri[parentUri] = [childUri];
        }
      }
      if (slugSegments.length > 1) {
        addChild(parentUri, locale, slugSegments);
      }
    }

    // Build "childrenByUri", a map of every possible parent URI
    // to its list of actual child document URI's.
    for (const uri of Object.keys(pagesByUri)) {
      const [locale, ...slugSegments] = uri
        .replace("/docs/", " ")
        .replace(/\//g, " ")
        .trim()
        .split(" ");
      addChild(uri, locale, slugSegments);
    }
  }

  getChildren(url, includeSelf) {
    // We don't need "depth" since its handled dynamically (lazily).
    // The caller can keep requesting "subpages" as deep as the
    // hierarchy goes, and they will be provided on-demand.
    const uriKey = getUriKey(url);
    if (!this.pagesByUri.hasOwnProperty(uriKey)) {
      return Object.freeze([]);
    }
    const pageData = this.pagesByUri[uriKey];
    if (includeSelf) {
      return Object.freeze([pageData]);
    }
    return pageData.subpages;
  }

  getTranslations(url) {
    const uriKey = getUriKey(url);
    if (this.pagesByUri.hasOwnProperty(uriKey)) {
      return this.pagesByUri[uriKey].translations;
    }
    return Object.freeze([]);
  }

  getPage(url) {
    const uriKey = getUriKey(url);
    if (this.pagesByUri.hasOwnProperty(uriKey)) {
      return this.pagesByUri[uriKey];
    }
    return Object.freeze({});
  }
}

class Renderer {
  constructor(pageInfoByUri) {
    this.templates = new Templates();
    this.allPagesInfo = new AllPagesInfo(pageInfoByUri);
  }

  async render(source, pageEnvironment) {
    // Build if we haven't already.
    this.allPagesInfo.build();
    return renderMacros(
      source,
      this.templates,
      pageEnvironment,
      this.allPagesInfo
    );
  }
}

module.exports = Renderer;
