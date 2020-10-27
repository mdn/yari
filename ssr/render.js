import fs from "fs";
import path from "path";

import jsesc from "jsesc";
import cheerio from "./monkeypatched-cheerio";
import { renderToString } from "react-dom/server";

import {
  GOOGLE_ANALYTICS_ACCOUNT,
  GOOGLE_ANALYTICS_DEBUG,
} from "../build/constants";

const lazy = (creator) => {
  let res;
  let processed = false;
  return () => {
    if (processed) return res;
    res = creator.apply(this, arguments);
    processed = true;
    return res;
  };
};

const readBuildHTML = lazy(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "../../client/build/index.html"),
    "utf8"
  );
  if (!html.includes('<div id="root"></div>')) {
    throw new Error(
      'The render depends on being able to inject into <div id="root"></div>'
    );
  }
  return html;
});

const getGoogleAnalyticsJS = lazy(() => {
  // The reason for the `path.join(__dirname, ".."` is because this file you're
  // reading gets compiled by Webpack into ssr/dist/*.js
  const dntHelperCode = fs
    .readFileSync(
      path.join(__dirname, "..", "mozilla.dnthelper.min.js"),
      "utf-8"
    )
    .trim();
  return `
  // Mozilla DNT Helper
  ${dntHelperCode}
  // only load GA if DNT is not enabled
  if (Mozilla && !Mozilla.dntEnabled()) {
      window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
      ga('create', '${GOOGLE_ANALYTICS_ACCOUNT}', 'mozilla.org');
      ga('set', 'anonymizeIp', true);
  }`.trim();
});

function serializeDocumentData(data) {
  return jsesc(JSON.stringify(data), {
    json: true,
    isScriptContext: true,
  });
}

export default function render(renderApp, doc) {
  const buildHtml = readBuildHTML();
  const $ = cheerio.load(buildHtml);

  const rendered = renderToString(renderApp);

  let pageTitle = "MDN Web Docs"; // default
  let canonicalURL = "https://developer.mozilla.org";

  let pageDescription = "";

  if (doc) {
    // Use the doc's title instead
    pageTitle = doc.pageTitle;
    canonicalURL += doc.mdn_url;

    if (doc.summary) {
      pageDescription = doc.summary;
    }

    const documentDataTag = `<script>window.__data__ = JSON.parse(${serializeDocumentData(
      doc
    )});</script>`;
    $("#root").after(documentDataTag);
  }

  if (pageDescription) {
    // This overrides the default description. Also assumes there's always
    // one tag there already.
    $('meta[name="description"]').attr("content", pageDescription);
  }

  if (!doc.noIndexing) {
    $('<meta name="robots" content="noindex, nofollow">').insertAfter(
      $("meta").eq(-1)
    );
  }

  $('link[rel="canonical"]').attr("href", canonicalURL);

  if (GOOGLE_ANALYTICS_ACCOUNT) {
    const googleAnalyticsJS = getGoogleAnalyticsJS();
    if (googleAnalyticsJS) {
      $("<script>").text(`\n${googleAnalyticsJS}\n`).appendTo($("head"));
      $(
        `<script src="https://www.google-analytics.com/${
          GOOGLE_ANALYTICS_DEBUG ? "anaytics_debug" : "analytics"
        }.js"></script>`
      ).appendTo($("head"));
    }
  }

  $("title").text(pageTitle);

  $("#root").html(rendered);

  // Every script tag that create-react-app inserts, make them defer
  $("body script[src]").attr("defer", "");

  // Move the script tags from the body to the head.
  // That way the browser can notice, and start downloading these files sooner
  // but they'll still be executed after the first render.
  $("body script[src]").appendTo("head");
  $("body script[src]").remove();

  return $.html();
}
