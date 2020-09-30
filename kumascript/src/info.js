const { VALID_LOCALES, Document, Redirect } = require("../../content");

const DUMMY_BASE_URL = "https://example.com";

function repairURL(url) {
  // Returns a lowercase URI with common irregularities repaired.
  url = url.trim().toLowerCase();
  if (!url.startsWith("/")) {
    // Ensure the URI starts with a "/".
    url = "/" + url;
  }
  // Remove redundant forward slashes, like "//".
  url = url.replace(/\/{2,}/g, "/");
  // Ensure the URI starts with a valid locale.
  const maybeLocale = url.split("/")[1];
  if (!VALID_LOCALES.has(maybeLocale)) {
    if (maybeLocale === "en") {
      // Converts URI's like "/en/..." to "/en-us/...".
      url = url.replace(`/${maybeLocale}`, "/en-us");
    } else {
      // Converts URI's like "/web/..." to "/en-us/web/...", or
      // URI's like "/docs/..." to "/en-us/docs/...".
      url = "/en-us" + url;
    }
  }
  // Ensure the locale is followed by "/docs".
  const [locale, maybeDocs] = url.split("/").slice(1, 3);
  if (maybeDocs !== "docs") {
    // Converts URI's like "/en-us/web/..." to "/en-us/docs/web/...".
    url = url.replace(`/${locale}`, `/${locale}/docs`);
  }
  return url;
}

const info = {
  getPathname(url) {
    // This function returns just the pathname of the given "url", removing
    // any trailing "/".
    return new URL(url, DUMMY_BASE_URL).pathname.replace(/\/$/, "");
  },

  cleanURL(url, followRedirects = true) {
    // This function returns just the lowercase pathname of the given "url",
    // removing any trailing "/". The DUMMY_BASE_URL is not important here, since
    // we're only after the path of any incoming "url", but it's required by
    // the URL constructor when the incoming "url" is relative.
    const repairedURL = repairURL(
      new URL(url, DUMMY_BASE_URL).pathname.replace(/\/$/, "").toLowerCase()
    );
    if (followRedirects) {
      const resolvedURL = Redirect.resolve(repairedURL);
      if (resolvedURL !== repairedURL) {
        // The `Redirect.resolve()` returned an actual redirect, and that needs
        // to be "repaired" as well.
        // Remember, it defaults to the URL you passed in if nothing was found
        // in the redirects lookup.
        return repairURL(resolvedURL);
      }
      return resolvedURL;
    }
    return repairedURL;
  },

  getDescription(url) {
    const cleanedURL = info.cleanURL(url);
    let description = `${cleanedURL}`;
    if (cleanedURL !== url.toLowerCase()) {
      description += ` (derived from "${url}")`;
    }
    return description;
  },

  getChildren(url, includeSelf) {
    // We don't need "depth" since it's handled dynamically (lazily).
    // The caller can keep requesting "subpages" as deep as the
    // hierarchy goes, and they'll be provided on-demand.
    // IMPORTANT: The list returned does not need to be frozen since
    // it's re-created for each caller (so one caller can't mess with
    // another), but also should NOT be frozen since some macros sort
    // the list in-place.
    const page = info.getPage(url, { throwIfDoesNotExist: true });
    if (includeSelf) {
      return [page];
    }
    return page.subpages;
  },

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
    return info.getPage(url, { throwIfDoesNotExist: true }).translations;
  },

  getPage(url, { throwIfDoesNotExist = false, followRedirects = true } = {}) {
    const document = Document.findByURL(info.cleanURL(url, followRedirects));
    if (!document) {
      // The macros expect an empty object if the URL does not exist, so
      // "throwIfDoesNotExist" should only be used within "info" itself.
      if (throwIfDoesNotExist) {
        throw new Error(
          `${info.getDescription(url)} (url: ${url}) does not exist`
        );
      }
      return {};
    }

    const { locale, slug, title, summary, tags } = document.metadata;
    return {
      url: document.url,
      locale,
      slug,
      title,
      summary,
      tags: tags || [],
      translations: [], //TODO Object.freeze(buildTranslationObjects(data)),
      get subpages() {
        return Document.findChildren(document.url)
          .map((document) =>
            info.getPage(document.url, {
              // By default, the `getPage()` method will follow any redirects
              // in it's pursuit to turn a URL into a "page object". But,
              // the `subpages()` getter should not do this. It doesn't make
              // sense to as a page: "What are your sub-pages?" and then,
              // potentially, get pages that are not actually sub-pages.
              // This way, sub-pages is strictly the result of
              // purely calling `Document.findChildren()` but dressing it up
              // according to how `getPage()` returns it.
              followRedirects: false,
            })
          )
          .filter((p) => p && p.url);
      },
    };
  },

  hasPage(url) {
    return Boolean(Document.findByURL(info.cleanURL(url)));
  },
};

module.exports = info;
