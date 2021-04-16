const cheerio = require("cheerio");

const Parser = require("./parser.js");
const { VALID_LOCALES, Document, Redirect } = require("../../content");
const { m2hSync } = require("../../markdown");

const DUMMY_BASE_URL = "https://example.com";

const MACROS_IN_SUMMARY_TO_IGNORE = new Set([
  "apiref",
  "jsref",
  "compat",
  "index",
  "page",
  "gecko_minversion_inline",
  "obsolete_header",
  "gecko_minversion_header",
  "deprecated_header",
  "previous",
  "previousmenu",
  "previousnext",
  "previousmenunext",
  "wiki.localize",
  "quicklinkswithsubpages",
]);

const MACROS_IN_SUMMARY_TO_REPLACE_WITH_FIRST_ARGUMENT = new Set([
  "draft",
  "glossary",
  "anch",
]);

function repairURL(url) {
  // Returns a lowercase URI with common irregularities repaired.
  url = url.trim().toLowerCase();
  if (!url.startsWith("/")) {
    // Ensure the URI starts with a "/".
    url = `/${url}`;
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
      url = `/en-us${url}`;
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
    const page = info.getPageByURL(url, { throwIfDoesNotExist: true });
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
    return info.getPageByURL(url, { throwIfDoesNotExist: true }).translations;
  },

  getPageByURL(
    url,
    { throwIfDoesNotExist = false, followRedirects = true } = {}
  ) {
    // Always start by looking it up *without* following redirects.
    let document = Document.findByURL(info.cleanURL(url, false));
    // Usually, `followRedirects` is disabled if the caller definitely is not
    // not interested in following redirects (e.g. listing sub-pages)
    if (!document && followRedirects) {
      document = Document.findByURL(info.cleanURL(url, true));
    }
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
    return this.getPage(document);
  },

  getPage(document) {
    if (typeof document === "string") {
      console.trace(
        "getPage() was called with a string, presumably a URL. " +
          "This is deprecated in favor of getPageByURL()."
      );
      return this.getPageByURL(document);
    }

    const { locale, slug, title, tags } = document.metadata;
    const { rawBody, isMarkdown } = document;
    return {
      url: document.url,
      locale,
      slug,
      title,
      tags: tags || [],
      translations: [], // TODO Object.freeze(buildTranslationObjects(data)),
      get summary() {
        // Back in the old Kuma days we used to store the summary as another piece
        // of metadata on each document. It was always available, with any kumascript
        // macros rendered out.
        // In Yari, this is not possible. We don't duplicate the summary in every
        // document. Instead, we extract it from the document when we build it.
        // So, to avoid the whole chicken-and-egg problem, instead, we're going to
        // try to extract it on-the-fly, from raw HTML or Markdown.
        // Note, we can't always use Cheerio here because the `document.rawBody` is
        // actually not valid HTML, hence the desperate fall back on regex.
        // A lot of times, you'll actually find that the first paragraph isn't
        // a <p> tag. But often, in those cases it'll have that `seoSummary`
        // <span> tag. Like this for example:
        //
        //   <div><span class="seoSummary">The <code>window.stop()</code> ...
        //
        // So that's why we always start by looking for that tag first.
        let $ = null;
        let summary = "";
        try {
          $ = cheerio.load(isMarkdown ? m2hSync(rawBody) : rawBody);
          $("span.seoSummary, .summary").each((i, element) => {
            if (!summary) {
              const html = $(element)
                .html()
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'");
              summary = postProcessSummaryHTMLSnippet(html, document);
            }
          });
          if (!summary) {
            // To avoid <p> tags that are inside things like
            // `<div class="notecard>`, just remove those divs first.
            $("div.notecard, div.note, div.blockIndicator").remove();
            $("p").each((i, element) => {
              if (!summary) {
                const html = $(element)
                  .html()
                  .replace(/&quot;/g, '"')
                  .replace(/&apos;/g, "'");
                summary = postProcessSummaryHTMLSnippet(html, document);
              }
            });
          }
        } catch (er) {
          console.warn(
            `Cheerio on document.rawBody (${document.url}) failed to parse`,
            er
          );
        }
        return summary;
      },
      get subpages() {
        return Document.findChildren(document.url)
          .map((document) => info.getPage(document))
          .filter((p) => p && p.url);
      },
    };
  },

  hasPage(url) {
    return Boolean(Document.findByURL(info.cleanURL(url)));
  },
};

/**
 * Return the HTML string as if we had it KumaScript rendered. When we extract
 * a summary from the raw HTML, we sometimes get things like KS macros in it.
 * We can't fully/properly render these because it can easily get us into an
 * infinite recursion problem. So we have to make the most of it we can from
 * the raw HTML.
 *
 * @param {string} text The summary as taken from the raw HTML.
 */
function postProcessSummaryHTMLSnippet(text, document) {
  if (!text.trim()) {
    return "";
  }
  let tokens;
  try {
    tokens = Parser.parse(text);
  } catch (e) {
    // Unfortunate, but not the right time to flag this as a flaw.
    console.warn(
      `(${document.url}) Unable to Parser.parse() text '${text}' due to error:`,
      e
    );
    return text;
  }

  let output = "";

  for (const token of tokens) {
    if (token.type !== "MACRO") {
      // If it isn't a MACRO token, it's a TEXT token.
      output += token.chars;
      continue;
    }
    if (!token.args.length) {
      // Any macro that doesn't have arguments should just be ignored.
      // Examples are:
      //  {{AddonsSidebar }}
      //  {{ SeeCompatTable() }}
      //  {{Non-standard_header}}
      //  {{Non-standard_header()}}
      continue;
    }

    const macroName = token.name.toLowerCase();

    // Some macros do have arguments, but there's no good reason to render them out
    // for the benefit of a summary, in this context.
    if (MACROS_IN_SUMMARY_TO_IGNORE.has(macroName)) {
      continue;
    }

    if (MACROS_IN_SUMMARY_TO_REPLACE_WITH_FIRST_ARGUMENT.has(macroName)) {
      output += token.args[0];
    } else if (macroName === "interwiki") {
      // Include the last one. E.g.
      //   {{Interwiki("wikipedia","Flynn%27s_taxonomy","classification of computer")}}
      output += token.args[token.args.length - 1];
    } else {
      output += `<code>${token.args[0]}</code>`;
    }
  }
  return output.trim();
}

module.exports = info;
