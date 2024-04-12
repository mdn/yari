import { renderToString } from "react-dom/server";
import { HydrationData } from "../libs/types/hydration";

import { DEFAULT_LOCALE } from "../libs/constants/index";
import {
  ALWAYS_ALLOW_ROBOTS,
  BASE_URL,
  WEBFONT_TAGS,
  GTAG_PATH,
} from "./include";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import HTML from "../client/build/index.html?raw";

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

function htmlEscape(s: string) {
  if (!s) {
    return s;
  }
  return s
    .replace(/&/gim, "&amp;")
    .replace(/"/gim, "&quot;")
    .replace(/</gim, "&lt;")
    .replace(/>/gim, "&gt;")
    .replace(/'/gim, "&apos;");
}

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

const lazy = (creator) => {
  let res;
  let processed = false;
  return (...args) => {
    if (processed) return res;
    res = creator.apply(this, ...args);
    processed = true;
    return res;
  };
};

// Path strings are preferred over URLs here to mitigate Webpack resolution

const readBuildHTML = lazy(() => {
  if (!HTML.includes('<div id="root"></div>')) {
    throw new Error(
      'The render depends on being able to inject into <div id="root"></div>'
    );
  }
  const scripts: string[] = [];
  const gaScriptPathName = GTAG_PATH;
  if (gaScriptPathName) {
    scripts.push(`<script src="${gaScriptPathName}" defer=""></script>`);
  }

  const html = HTML.replace('<meta name="SSR_SCRIPTS"/>', () =>
    scripts.join("")
  );
  return html;
});

export default function render(
  renderApp,
  url: string,
  {
    doc = null,
    pageNotFound = false,
    hyData = null,
    pageTitle = null,
    possibleLocales = null,
    locale = null,
    noIndexing = null,
    image = null,
    blogMeta = null,
  }: HydrationData = { url }
) {
  const buildHtml = readBuildHTML();
  const rendered = renderToString(renderApp);

  let canonicalURL = BASE_URL;

  let pageDescription = "";
  let escapedPageTitle = htmlEscape(pageTitle);

  const hydrationData: HydrationData = { url };
  const translations: string[] = [];
  if (blogMeta) {
    hydrationData.blogMeta = blogMeta;
  }
  if (pageNotFound) {
    escapedPageTitle = `🤷🏽‍♀️ Page not found | ${
      escapedPageTitle || "MDN Web Docs"
    }`;
    hydrationData.pageNotFound = true;
  } else if (hyData) {
    hydrationData.hyData = hyData;
  } else if (doc) {
    // Use the doc's title instead
    escapedPageTitle = htmlEscape(doc.pageTitle);
    canonicalURL += doc.mdn_url;

    if (doc.summary) {
      pageDescription = htmlEscape(doc.summary);
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
          `<link rel="alternate" title="${htmlEscape(
            translation.title
          )}" href="https://developer.mozilla.org${translationURL}" hreflang="${getHrefLang(
            translation.locale,
            allLocales
          )}"/>`
        );
      }
    }
  }

  if (possibleLocales) {
    hydrationData.possibleLocales = possibleLocales;
  }

  const titleTag = `<title>${escapedPageTitle || "MDN Web Docs"}</title>`;

  // Open Graph protocol expects `language_TERRITORY` format.
  const ogLocale = (locale || (doc && doc.locale) || DEFAULT_LOCALE).replace(
    "-",
    "_"
  );

  const og = new Map([
    ["title", escapedPageTitle],
    ["url", canonicalURL],
    ["locale", ogLocale],
  ]);

  if (pageDescription) {
    og.set("description", pageDescription);
  }

  if (image) {
    og.set("image", image);
  }

  const root = `<div id="root">${rendered}</div><script type="application/json" id="hydration">${
    // https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
    JSON.stringify(hydrationData).replace(
      /<(?=!--|\/?script)/gi,
      String.raw`\u003c`
    )
  }</script>`;

  const robotsContent =
    !ALWAYS_ALLOW_ROBOTS ||
    (doc && doc.noIndexing) ||
    pageNotFound ||
    noIndexing
      ? "noindex, nofollow"
      : "index, follow";
  const robotsMeta = `<meta name="robots" content="${robotsContent}">`;
  const rssLink = `<link rel="alternate" type="application/rss+xml" title="MDN Blog RSS Feed" href="${BASE_URL}/${DEFAULT_LOCALE}/blog/rss.xml" hreflang="en" />`;
  const ssr_data = [...translations, ...WEBFONT_TAGS, rssLink, robotsMeta];
  let html = buildHtml;
  html = html.replace(
    '<html lang="en"',
    () => `<html lang="${locale || DEFAULT_LOCALE}"`
  );
  html = html.replace(
    /<meta property="og:([^"]*)" content="([^"]*)"\/>/g,
    (_, typ, content) => {
      return `<meta property="og:${typ}" content="${og.get(typ) || content}"/>`;
    }
  );
  if (pageDescription) {
    html = html.replace(/<meta name="description" content="[^"]*"\/>/g, () => {
      return `<meta name="description" content="${pageDescription}"/>`;
    });
  }
  html = html.replace("<title>MDN Web Docs</title>", () => `${titleTag}`);

  if (!pageNotFound) {
    html = html.replace(
      '<link rel="canonical" href="https://developer.mozilla.org"/>',
      () => `<link rel="canonical" href="${canonicalURL}"/>`
    );
  }

  html = html.replace('<meta name="SSR_DATA"/>', () => ssr_data.join(""));
  html = html.replace('<div id="root"></div>', () => root);
  return html;
}
