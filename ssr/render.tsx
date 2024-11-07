import { renderToString } from "react-dom/server";
import { HydrationData } from "../libs/types/hydration";

import { DEFAULT_LOCALE } from "../libs/constants/index";
import {
  ALWAYS_ALLOW_ROBOTS,
  BASE_URL,
  WEBFONT_URLS,
  GTAG_PATH,
  ASSET_MANIFEST,
} from "./include";
import { getMetaDescription } from "./meta-description";

import favicon from "../client/public/favicon-48x48.png?public";
import appleIcon from "../client/public/apple-touch-icon.png?public";
import manifest from "../client/public/manifest.json?public";
import ogImage from "../client/public/mdn-social-share.png?public";
import printCSS from "./print.css?inline";
import themeJS from "./theme.js?inline";

// When there are multiple options for a given language, this gives the
// preferred locale for that language (language => preferred locale).
const PREFERRED_LOCALE = {
  pt: "pt-PT",
  zh: "zh-CN",
};

// We should use the language tag (e.g. "zh-Hans") instead of the locale.
// This is a map of locale => language tag.
// See https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
const LANGUAGE_TAGS = Object.freeze({
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
});

function getHrefLang(locale: string, allLocales: Array<string>) {
  // In most cases, just return the language code, removing the country
  // code if present (so, for example, 'en-US' becomes 'en').
  const hreflang = locale.split("-")[0];

  // Suppose the locale is one that is ambiguous, we need to fall back on a
  // a preferred one. For example, if the document is available in 'zh-CN' and
  // in 'zh-TW', we need to output something like this:
  //   <link rel=alternate hreflang=zh href=...>
  //   <link rel=alternate hreflang=zh-Hant href=...>
  //
  // But other bother if both ambigious locale-to-hreflang are present.
  const preferred = PREFERRED_LOCALE[hreflang];
  if (preferred) {
    // e.g. `preferred===zh-CN` if hreflang was `zh`
    if (locale !== preferred) {
      // e.g. `locale===zh-TW`
      if (allLocales.includes(preferred)) {
        // If the more preferred one was there, use the locale + region format.
        return LANGUAGE_TAGS[locale] ?? locale;
      }
    }
  }
  return hreflang;
}

export default function render(
  renderApp,
  url: string,
  {
    doc = null,
    pageNotFound = false,
    hyData = null,
    pageTitle = null,
    pageDescription = "",
    possibleLocales = null,
    locale = null,
    noIndexing = false,
    onlyFollow = false,
    image = null,
    blogMeta = null,
  }: HydrationData = { url }
) {
  const canonicalURL = `${BASE_URL}${url}`;

  let realPageTitle = pageTitle;
  let metaDescription = pageDescription;

  const hydrationData: HydrationData = { url };
  const translations: JSX.Element[] = [];
  if (blogMeta) {
    hydrationData.blogMeta = blogMeta;
  }
  if (pageNotFound) {
    realPageTitle = `🤷🏽‍♀️ Page not found | ${realPageTitle || "MDN Web Docs"}`;
    hydrationData.pageNotFound = true;
  } else if (hyData) {
    hydrationData.hyData = hyData;
  } else if (doc) {
    // Use the doc's title instead
    realPageTitle = doc.pageTitle;

    metaDescription = getMetaDescription(doc);
    if (doc.summary) {
      pageDescription = doc.summary;
    }

    hydrationData.doc = doc;

    if (doc.other_translations) {
      // Note, we also always include "self" as a locale. That's why we concat
      // this doc's locale plus doc.other_translations.
      const thisLocale = {
        locale: doc.locale,
        title: doc.title,
        url: doc.mdn_url,
      };

      const allTranslations = [...doc.other_translations, thisLocale];
      const allLocales = allTranslations.map((t) => t.locale);

      for (const translation of allTranslations) {
        const translationURL = doc.mdn_url.replace(
          `/${doc.locale}/`,
          () => `/${translation.locale}/`
        );
        // The locale used in `<link rel="alternate">` needs to be the ISO-639-1
        // code. For example, it's "en", not "en-US". And it's "sv" not "sv-SE".
        // See https://developers.google.com/search/docs/specialty/international/localized-versions#language-codes
        translations.push(
          <link
            rel="alternate"
            title={translation.title}
            href={`https://developer.mozilla.org${translationURL}`}
            hrefLang={getHrefLang(translation.locale, allLocales)}
          />
        );
      }
    }
  }

  if (possibleLocales) {
    hydrationData.possibleLocales = possibleLocales;
  }

  // Open Graph protocol expects `language_TERRITORY` format.
  const ogLocale = (locale || (doc && doc.locale) || DEFAULT_LOCALE).replace(
    "-",
    "_"
  );

  if (locale === "de") {
    // Prevent experimental German locale from being indexed.
    onlyFollow = true;
  }
  const robotsContent =
    !ALWAYS_ALLOW_ROBOTS || (doc && doc.noIndexing) || noIndexing
      ? "noindex, nofollow"
      : onlyFollow
        ? "noindex, follow"
        : "";

  return (
    "<!doctype html>" +
    renderToString(
      <html lang={locale || DEFAULT_LOCALE} prefix="og: https://ogp.me/ns#">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />

          <link rel="icon" href={favicon} />

          <link rel="apple-touch-icon" href={appleIcon} />

          <meta name="theme-color" content="#ffffff" />

          <link rel="manifest" href={manifest} />

          <link
            rel="search"
            type="application/opensearchdescription+xml"
            href="/opensearch.xml"
            title="MDN Web Docs"
          />

          <title>{realPageTitle || "MDN Web Docs"}</title>
          {translations}
          {WEBFONT_URLS.map((url) => (
            <link
              rel="preload"
              as="font"
              type="font/woff2"
              href={url}
              crossOrigin=""
            />
          ))}
          <link
            rel="alternate"
            type="application/rss+xml"
            title="MDN Blog RSS Feed"
            href={`${BASE_URL}/${DEFAULT_LOCALE}/blog/rss.xml`}
            hrefLang="en"
          />
          {robotsContent && <meta name="robots" content={robotsContent} />}
          <meta
            name="description"
            content={
              metaDescription ||
              "The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps."
            }
          />

          <meta
            property="og:url"
            content={canonicalURL || "https://developer.mozilla.org"}
          />
          <meta property="og:title" content={realPageTitle || "MDN Web Docs"} />
          <meta property="og:type" content="website" />
          <meta property="og:locale" content={ogLocale || "en_US"} />
          <meta
            property="og:description"
            content={
              pageDescription ||
              "The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps."
            }
          />
          <meta property="og:image" content={image || ogImage} />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:height" content="1080" />
          <meta property="og:image:width" content="1920" />
          <meta
            property="og:image:alt"
            content="The MDN Web Docs logo, featuring a blue accent color, displayed on a solid black background."
          />
          <meta property="og:site_name" content="MDN Web Docs" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:creator" content="MozDevNet" />

          {!pageNotFound && <link rel="canonical" href={canonicalURL} />}
          <style
            media="print"
            dangerouslySetInnerHTML={{
              __html: printCSS,
            }}
          />
          {GTAG_PATH && <script src={GTAG_PATH} defer />}
          {ASSET_MANIFEST.entrypoints.map((url) =>
            url.endsWith(".js") ? <script defer src={`/${url}`} /> : null
          )}
          {ASSET_MANIFEST.entrypoints.map((url) =>
            url.endsWith(".css") ? (
              <link href={`/${url}`} rel="stylesheet" />
            ) : null
          )}
        </head>

        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: themeJS,
            }}
          />
          <div id="root">{renderApp}</div>
          <script
            type="application/json"
            id="hydration"
            dangerouslySetInnerHTML={{
              __html:
                // https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
                JSON.stringify(hydrationData).replace(
                  /<(?=!--|\/?script)/gi,
                  String.raw`\u003c`
                ),
            }}
          />
        </body>
      </html>
    )
  );
}
