import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import cheerio from "cheerio";

import { ALWAYS_ALLOW_ROBOTS, BUILD_OUT_ROOT } from "../libs/env";

const { DEFAULT_LOCALE } = require("../libs/constants");

const dirname = __dirname;

// When there are multiple options for a given language, this gives the
// preferred locale for that language (language => preferred locale).
const PREFERRED_LOCALE = {
  pt: "pt-PT",
  zh: "zh-CN",
};

function getHrefLang(locale, otherLocales) {
  // In most cases, just return the language code, removing the country
  // code if present (so, for example, 'en-US' becomes 'en').
  const hreflang = locale.split("-")[0];

  // Suppose the locale is one that is ambiguous, we need to fall back on a
  // a preferred one. For example, if the document is available in 'zh-CN' and
  // in 'zh-TW', we need to output something like this:
  //   <link rel=alternate hreflang=zh href=...>
  //   <link rel=alternate hreflang=zh-TW href=...>
  //
  // But other bother if both ambigious locale-to-hreflang are present.
  const preferred = PREFERRED_LOCALE[hreflang];
  if (preferred) {
    // e.g. `preferred===zh-CN` if hreflang was `zh`
    if (locale !== preferred) {
      // e.g. `locale===zh-TW`
      if (otherLocales.includes(preferred)) {
        // If the more preferred one was there, use the locale + region format.
        return locale;
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

const clientBuildRoot = path.resolve(dirname, "../../client/build");

const readBuildHTML = lazy(() => {
  const html = fs.readFileSync(
    path.join(clientBuildRoot, "index.html"),
    "utf-8"
  );
  if (!html.includes('<div id="root"></div>')) {
    throw new Error(
      'The render depends on being able to inject into <div id="root"></div>'
    );
  }
  return html;
});

const getGAScriptPathName = lazy((relPath = "/static/js/ga.js") => {
  // Return the relative path if there exists a `BUILD_ROOT/static/js/ga.js`.
  // If the file doesn't exist, return falsy.
  // Remember, unless explicitly set, the BUILD_OUT_ROOT defaults to a path
  // based on `dirname` but that's wrong when compared as a source and as
  // a webpack built asset. So we need to remove the `/ssr/` portion of the path.
  let root = BUILD_OUT_ROOT;
  if (!fs.existsSync(root)) {
    root = root
      .split(path.sep)
      .filter((x) => x !== "ssr")
      .join(path.sep);
  }
  const filePath = relPath.split("/").slice(1).join(path.sep);
  if (fs.existsSync(path.join(root, filePath))) {
    return relPath;
  }
  return null;
});

const extractWebFontURLs = lazy(() => {
  const urls = [];
  const manifest = JSON.parse(
    fs.readFileSync(path.join(clientBuildRoot, "asset-manifest.json"), "utf-8")
  );
  for (const entrypoint of manifest.entrypoints) {
    if (!entrypoint.endsWith(".css")) continue;
    const css = fs.readFileSync(
      path.join(clientBuildRoot, entrypoint),
      "utf-8"
    );
    const generator = extractCSSURLs(
      css,
      (url) => url.endsWith(".woff2") && /Bold/i.test(url)
    );
    urls.push(...generator);
  }
  return urls;
});

function* extractCSSURLs(css, filterFunction) {
  for (const match of css.matchAll(/url\((.*?)\)/g)) {
    const url = match[1];
    if (filterFunction(url)) {
      yield url;
    }
  }
}

interface HydrationData {
  doc?: any;
  pageNotFound?: boolean;
  hyData?: any;
  pageTitle?: any;
  possibleLocales?: any;
  locale?: any;
  noIndexing?: any;
}

export default function render(
  renderApp,
  {
    doc = null,
    pageNotFound = false,
    hyData = null,
    pageTitle = null,
    possibleLocales = null,
    locale = null,
    noIndexing = null,
  }: HydrationData = {}
) {
  const buildHtml = readBuildHTML();
  const webfontURLs = extractWebFontURLs();
  const $ = cheerio.load(buildHtml);

  // Some day, we'll have the chrome localized and then this can no longer be
  // hardcoded to 'en'. But for now, the chrome is always in "English (US)".
  $("html").attr("lang", locale || DEFAULT_LOCALE);

  const rendered = renderToString(renderApp);

  if (!pageTitle) {
    pageTitle = "MDN Web Docs"; // default
  }
  let canonicalURL = "https://developer.mozilla.org";

  let pageDescription = "";

  const hydrationData: HydrationData = {};
  if (pageNotFound) {
    pageTitle = `🤷🏽‍♀️ Page not found | ${pageTitle}`;
    hydrationData.pageNotFound = true;
  } else if (hyData) {
    hydrationData.hyData = hyData;
  } else if (doc) {
    // Use the doc's title instead
    pageTitle = doc.pageTitle;
    canonicalURL += doc.mdn_url;

    if (doc.summary) {
      pageDescription = doc.summary;
    }

    hydrationData.doc = doc;

    if (doc.other_translations) {
      const allOtherLocales = doc.other_translations.map((t) => t.locale);
      // Note, we also always include "self" as a locale. That's why we concat
      // this doc's locale plus doc.other_translations.
      const thisLocale = {
        locale: doc.locale,
        title: doc.title,
        url: doc.mdn_url,
      };
      for (const translation of [...doc.other_translations, thisLocale]) {
        const translationURL = doc.mdn_url.replace(
          `/${doc.locale}/`,
          `/${translation.locale}/`
        );
        // The locale used in `<link rel="alternate">` needs to be the ISO-639-1
        // code. For example, it's "en", not "en-US". And it's "sv" not "sv-SE".
        // See https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&visit_id=637411409912568511-3980844248&rd=1#language-codes
        $('<link rel="alternate">')
          .attr("title", translation.title)
          .attr("href", `https://developer.mozilla.org${translationURL}`)
          .attr("hreflang", getHrefLang(translation.locale, allOtherLocales))
          .insertAfter("title");
      }
    }
  }

  if (possibleLocales) {
    hydrationData.possibleLocales = possibleLocales;
  }

  $("#root").after(
    `<script type="application/json" id="hydration">${
      // https://html.spec.whatwg.org/multipage/scripting.html#restrictions-for-contents-of-script-elements
      JSON.stringify(hydrationData).replace(
        /<(?=!--|\/?script)/gi,
        String.raw`\u003c`
      )
    }</script>`
  );

  if (pageDescription) {
    // This overrides the default description. Also assumes there's always
    // one tag there already.
    $('meta[name="description"]').attr("content", pageDescription);
    $('meta[property="og:description"]').attr("content", pageDescription);
  }

  const robotsContent =
    !ALWAYS_ALLOW_ROBOTS ||
    (doc && doc.noIndexing) ||
    pageNotFound ||
    noIndexing
      ? "noindex, nofollow"
      : "index, follow";
  $(`<meta name="robots" content="${robotsContent}">`).insertAfter(
    $("meta").eq(-1)
  );

  if (!pageNotFound) {
    $('link[rel="canonical"]').attr("href", canonicalURL);
  }

  // As part of the pre-build steps, in the build root, a `ga.js` file is generated.
  // The SSR rendering needs to know if exists and if so, what it's URL pathname is.
  // The script will do two things:
  //  1. created a `window.ga` object
  //  2. async inject the download of that remote
  //     https://www.google-analytics.com/analytics.js file.
  // With this script appearing before any other (also deferred) JS bundles,
  // the `window.ga` will be immediately available but the remote analytics.js
  // can come in when it comes in and it will send.
  const gaScriptPathName = getGAScriptPathName();
  if (gaScriptPathName) {
    $("<script>")
      .attr("defer", "")
      .attr("src", gaScriptPathName)
      .appendTo($("head"));
  }

  const $title = $("title");
  $title.text(pageTitle);
  $('meta[property="og:url"]').attr("content", canonicalURL);
  $('meta[property="og:title"]').attr("content", pageTitle);
  $('meta[property="og:locale"]').attr(
    "content",
    locale ? locale : doc ? doc.locale : "en-US"
  );

  for (const webfontURL of webfontURLs) {
    $('<link rel="preload" as="font" type="font/woff2" crossorigin>')
      .attr("href", webfontURL)
      .insertAfter($title);
  }

  $("#root").html(rendered);

  // Every script tag that create-react-app inserts, make them defer
  $("body script[src]").attr("defer", "");

  // Move the script tags from the body to the head.
  // That way the browser can notice, and start downloading these files sooner
  // but they'll still be executed after the first render.
  $("body script[src]").appendTo($("head"));
  $("body script[src]").remove();

  return $.html();
}
