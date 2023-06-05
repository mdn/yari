import fs from "node:fs";

import { Document, Redirect, FileAttachment } from "../../content/index.js";
import { findMatchesInText, findMatchesInMarkdown } from "../matches.js";
import {
  DEFAULT_LOCALE,
  FLAW_LEVELS,
  VALID_LOCALES,
} from "../../libs/constants/index.js";
import { isValidLocale } from "../../libs/locale-utils/index.js";
import * as cheerio from "cheerio";
import { Doc } from "../../libs/types/document.js";
import { Flaw } from "./index.js";

const _safeToHttpsDomains = new Map();

function getSafeToHttpDomains() {
  if (!_safeToHttpsDomains.size) {
    const fileParsed = JSON.parse(
      fs.readFileSync(
        new URL("safe-to-https-domains.json", import.meta.url),
        "utf-8"
      )
    );
    Object.entries(fileParsed).forEach(([key, value]) =>
      _safeToHttpsDomains.set(key, value)
    );
  }
  return _safeToHttpsDomains;
}

function isHomepageURL(url) {
  // Return true if the URL is something like `/` or `/en-US` or `/fr/`
  if (url === "/") {
    return true;
  }
  if (!url.endsWith("/")) {
    url += "/";
  }
  const split = url.split("/");
  return split.length === 3 && isValidLocale(split[1]);
}

function mutateLink(
  $element: cheerio.Cheerio<cheerio.Element>,
  suggestion: string = null,
  enUSFallback: string = null,
  isSelfLink = false
) {
  if (isSelfLink) {
    $element.attr("aria-current", "page");
  } else if (suggestion) {
    $element.attr("href", suggestion);
  } else if (enUSFallback) {
    $element.attr("href", enUSFallback);
    $element.append(` <small>(${DEFAULT_LOCALE})<small>`);
    $element.addClass("only-in-en-us");
    $element.attr("title", "Currently only available in English (US)");
  } else {
    $element.addClass("page-not-created");
    $element.attr("title", "This is a link to an unwritten page");
  }
}

// The 'broken_links' flaw check looks for internal links that
// link to a document that's going to fail with a 404 Not Found.
export function getBrokenLinksFlaws(
  doc: Partial<Doc>,
  $: cheerio.CheerioAPI,
  { rawContent },
  level
) {
  const flaws: Flaw[] = [];

  // This is needed because the same href can occur multiple time.
  // For example:
  //    <a href="/foo/bar">
  //    <a href="/foo/other">
  //    <a href="/foo/bar">  (again!)
  // In this case, when we call `addBrokenLink()` that third time, we know
  // this refers to the second time it appears. That's important for the
  // sake of finding which match, in the original source (rawContent),
  // it belongs to.
  const checked = new Map<string, number>();

  // Our cache for looking things up by `href`. This basically protects
  // us from calling `findMatchesInText()` more than once.
  const matches = new Map();

  // A closure function to help making it easier to append flaws
  function addBrokenLink(
    $element: cheerio.Cheerio<cheerio.Element>,
    index: number,
    href: string,
    suggestion: string = null,
    explanation: string = null,
    enUSFallback: string = null,
    isSelfLink = false
  ) {
    mutateLink($element, suggestion, enUSFallback, isSelfLink);
    if (level === FLAW_LEVELS.IGNORE) {
      // Note, even if not interested in flaws, we still need to apply the
      // suggestion. For example, in production builds, we don't care about
      // logging flaws, but because not all `broken_links` flaws have been
      // manually fixed at the source.
      return;
    }

    explanation = explanation || `Can't resolve ${href}`;

    if (!matches.has(href)) {
      matches.set(
        href,

        doc.isMarkdown
          ? findMatchesInMarkdown(href, rawContent, { type: "link" })
          : findMatchesInText(href, rawContent, {
              attribute: "href",
            })
      );
    }

    matches.get(href).forEach((match, i) => {
      if (i !== index) {
        return;
      }
      const id = `link${flaws.length + 1}`;
      const fixable = !!suggestion;
      $element.attr("data-flaw", id);
      flaws.push(
        Object.assign({ explanation, id, href, suggestion, fixable }, match)
      );
    });
  }

  $("a[href]").each((i, element) => {
    const a = $(element);
    let href = a.attr("href");
    try {
      // When Markdown turns into HTML it will encode the `href` values in the
      // links. To be able to treat it as if it was from its raw value,
      // we first decode it. That way we can find out it was originally written
      // in the `index.md` file, for example.
      // But not all URLs can be applied with `decodeURI`. For example:
      // https://www.ecma-international.org/ecma-262/6.0/#sec-get-%typedarray%.prototype.buffer
      // can't be decoded in Node.
      // So that's why we do this decoding very defensively.
      href = decodeURI(href);
    } catch (error) {
      console.warn(`Unable to decodeURI '${href}'. Will proceed without.`);
    }

    // This gives us insight into how many times this exact `href`
    // has been encountered in the doc.
    // Then, when we call addBrokenLink() we can include an index so that
    // that function knows which match it's referring to.
    checked.set(href, checked.has(href) ? checked.get(href) + 1 : 0);

    // Note, a lot of links are like this:
    //  <a href="/docs/Learn/Front-end_web_developer">
    // which means the author wanted the link to work in any language.
    // When checking it against disk, we'll have to assume a locale.
    const hrefSplit = href.split("#");
    let hrefNormalized = hrefSplit[0];
    if (hrefNormalized.startsWith("/docs/")) {
      const thisDocumentLocale = doc.mdn_url.split("/")[1];
      hrefNormalized = `/${thisDocumentLocale}${hrefNormalized}`;
    }

    if (
      hrefNormalized.endsWith("/contributors.txt") &&
      hrefNormalized.startsWith("/") &&
      !href.startsWith("//")
    ) {
      // Do nothing. The /contributors.txt URLs are special Yari URLs.
      return;
    }

    if (href.startsWith("http://")) {
      let domain = null;
      try {
        domain = new URL(href).hostname;
      } catch (err) {
        return addBrokenLink(
          a,
          checked.get(href),
          href,
          null,
          "Not a valid link URL"
        );
      }
      // If a URL's domain is in the list that getSafeToHttpDomains() provides,
      // that means we've tested that you can turn that into a HTTPS link
      // simply by replacing the `http://` for `https://`.
      // Using `.get(domain)` is smart because if the domain isn't known you
      // get `undefined` otherwise you get `true` or `false`. And we're only
      // interested in the `true`.
      if (getSafeToHttpDomains().get(domain)) {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          href.replace("http://", "https://"),
          "Is currently http:// but can become https://"
        );
      }
      // Note! If it's not known that the URL's domain can be turned into https://
      // we do nothing here. No flaw. It's unfortunate that we still have http://
      // links in our content but that's a reality of MDN being 15+ years old.
    } else if (href.startsWith("https://developer.mozilla.org/")) {
      // It might be a working 200 OK link but the link just shouldn't
      // have the full absolute URL part in it.
      const absoluteURL = new URL(href);
      addBrokenLink(
        a,
        checked.get(href),
        href,
        absoluteURL.pathname + absoluteURL.search + absoluteURL.hash
      );
    } else if (isHomepageURL(hrefNormalized)) {
      // But did you spell it perfectly?
      const homepageLocale = hrefNormalized.split("/")[1];
      if (
        hrefNormalized !== "/" &&
        (VALID_LOCALES.get(homepageLocale.toLowerCase()) !== homepageLocale ||
          !hrefNormalized.endsWith("/"))
      ) {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          `/${VALID_LOCALES.get(homepageLocale.toLowerCase())}/`
        );
      }
    } else if (hrefNormalized.toLowerCase() === doc.mdn_url.toLowerCase()) {
      if (hrefSplit.length > 1) {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          `#${hrefSplit[1]}`,
          "No need for the pathname in anchor links if it's the same page",
          null,
          true
        );
      } else {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          null,
          "Link points to the page it's already on",
          null,
          true
        );
      }
    } else if (href.startsWith("/") && !href.startsWith("//")) {
      // Got to fake the domain to sensible extract the .search and .hash
      const absoluteURL = new URL(href, "http://www.example.com");
      const found = Document.findByURL(hrefNormalized);
      if (!found) {
        // Before we give up, check if it's an attachment.
        if (!FileAttachment.findByURLWithFallback(hrefNormalized)) {
          // Even if it's a redirect, it's still a flaw, but it'll be nice to
          // know what it *should* be.
          const resolved = Redirect.resolve(hrefNormalized);
          if (resolved !== hrefNormalized) {
            addBrokenLink(
              a,
              checked.get(href),
              href,
              resolved + absoluteURL.search + absoluteURL.hash.toLowerCase()
            );
          } else {
            let enUSFallbackURL = null;
            // Test if the document is a translated document and the link isn't
            // to an en-US URL. We know the link is broken (in this locale!)
            // but it might be "salvageable" if we link the en-US equivalent.
            // This is, by the way, the same trick the `web.smartLink()` utility
            // function does in kumascript rendering.
            if (
              doc.locale !== DEFAULT_LOCALE &&
              href.startsWith(`/${doc.locale}/`)
            ) {
              // What if you swich to the English link; would th link work
              // better then?
              const enUSHrefNormalized = hrefNormalized.replace(
                `/${doc.locale}/`,
                `/${DEFAULT_LOCALE}/`
              );
              const enUSFound = Document.findByURL(enUSHrefNormalized);
              if (enUSFound) {
                enUSFallbackURL = enUSFound.url;
              } else {
                const enUSResolved = Redirect.resolve(enUSHrefNormalized);
                if (enUSResolved !== enUSHrefNormalized) {
                  enUSFallbackURL =
                    enUSResolved +
                    absoluteURL.search +
                    absoluteURL.hash.toLowerCase();
                }
              }
            }
            addBrokenLink(
              a,
              checked.get(href),
              href,
              null,
              enUSFallbackURL
                ? "Can use the English (en-US) link as a fallback"
                : null,
              enUSFallbackURL
            );
          }
        }
        // But does it have the correct case?!
      } else if (found.url !== href.split("#")[0]) {
        // Inconsistent case.
        addBrokenLink(
          a,
          checked.get(href),
          href,
          found.url + absoluteURL.search + absoluteURL.hash.toLowerCase()
        );
      } else if (
        hrefSplit.length > 1 &&
        hrefSplit[1] !== hrefSplit[1].toLowerCase()
      ) {
        const hash = hrefSplit[1];
        addBrokenLink(
          a,
          checked.get(href),
          href,
          href.replace(`#${hash}`, `#${hash.toLowerCase()}`),
          "Anchor not lowercase"
        );
      }
    } else if (href.startsWith("#")) {
      const hash = href.split("#")[1];
      if (hash !== hash.toLowerCase()) {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          href.replace(`#${hash}`, `#${hash.toLowerCase()}`),
          "Anchor not lowercase"
        );
      }
    }
  });

  return flaws;
}
