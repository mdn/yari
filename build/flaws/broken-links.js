const fs = require("fs");
const path = require("path");

const { Archive, Document, Redirect, Image } = require("../../content");
const { FLAW_LEVELS } = require("../constants");
const { findMatchesInText } = require("../matches-in-text");
const { DEFAULT_LOCALE, VALID_LOCALES } = require("../../libs/constants");

const _safeToHttpsDomains = new Map();
function getSafeToHttpDomains() {
  if (!_safeToHttpsDomains.size) {
    const fileParsed = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "safe-to-https-domains.json"),
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
  return split.length === 3 && VALID_LOCALES.has(split[1].toLowerCase());
}

// The 'broken_links' flaw check looks for internal links that
// link to a document that's going to fail with a 404 Not Found.
function getBrokenLinksFlaws(doc, $, { rawContent }, level) {
  const flaws = [];

  // This is needed because the same href can occur multiple time.
  // For example:
  //    <a href="/foo/bar">
  //    <a href="/foo/other">
  //    <a href="/foo/bar">  (again!)
  // In this case, when we call `addBrokenLink()` that third time, we know
  // this refers to the second time it appears. That's important for the
  // sake of finding which match, in the original source (rawContent),
  // it belongs to.
  const checked = new Map();

  // Our cache for looking things up by `href`. This basically protects
  // us from calling `findMatchesInText()` more than once.
  const matches = new Map();

  function mutateLink($element, suggestion, enUSFallback) {
    if (suggestion) {
      $element.attr("href", suggestion);
    } else if (enUSFallback) {
      $element.attr("href", enUSFallback);
      // This functionality here should match what we do inside
      // the `web.smartLink()` function in kumascript rendering.
      $element.text(`${$element.text()} (${DEFAULT_LOCALE})`);
      $element.addClass("only-in-en-us");
      $element.attr("title", "Currently only available in English (US)");
    } else {
      throw new Error("Don't use this function if neither is true");
    }
  }

  // A closure function to help making it easier to append flaws
  function addBrokenLink(
    $element,
    index,
    href,
    suggestion = null,
    explanation = null,
    enUSFallback = null
  ) {
    if (level === FLAW_LEVELS.IGNORE) {
      // Note, even if not interested in flaws, we still need to apply the
      // suggestion. For example, in production builds, we don't care about
      // logging flaws, but because not all `broken_links` flaws have been
      // manually fixed at the source.
      if (suggestion || enUSFallback) {
        mutateLink($element, suggestion, enUSFallback);
      }
      return;
    }
    explanation = explanation || `Can't resolve ${href}`;

    if (!matches.has(href)) {
      matches.set(
        href,
        Array.from(
          findMatchesInText(href, rawContent, {
            attribute: "href",
          })
        )
      );
    }
    // findMatchesInText() is a generator function so use `Array.from()`
    // to turn it into an array so we can use `.forEach()` because that
    // gives us an `i` for every loop.
    matches.get(href).forEach((match, i) => {
      if (i !== index) {
        return;
      }
      const id = `link${flaws.length + 1}`;
      const fixable = !!suggestion;
      if (suggestion || enUSFallback) {
        mutateLink($element, suggestion, enUSFallback);
      }
      $element.attr("data-flaw", id);
      flaws.push(
        Object.assign({ explanation, id, href, suggestion, fixable }, match)
      );
    });
  }

  $("a[href]").each((i, element) => {
    const a = $(element);
    const href = a.attr("href");

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
    } else if (hrefNormalized === doc.mdn_url) {
      if (hrefSplit.length > 1) {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          `#${hrefSplit[1]}`,
          "No need for the pathname in anchor links if it's the same page"
        );
      } else {
        addBrokenLink(
          a,
          checked.get(href),
          href,
          null,
          "Link points to the page it's already on"
        );
      }
    } else if (href.startsWith("/") && !href.startsWith("//")) {
      // Got to fake the domain to sensible extract the .search and .hash
      const absoluteURL = new URL(href, "http://www.example.com");
      const found = Document.findByURL(hrefNormalized);
      if (!found) {
        // Before we give up, check if it's an image.
        if (
          !Image.findByURL(hrefNormalized) &&
          !Archive.isArchivedURL(hrefNormalized)
        ) {
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
              let enUSFound = Document.findByURL(enUSHrefNormalized);
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

module.exports = { getBrokenLinksFlaws };
