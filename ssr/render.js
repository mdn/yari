import fs from "fs";
import path from "path";

import jsesc from "jsesc";
import cheerio from "cheerio";
import { renderToString } from "react-dom/server";

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

  if (doc) {
    // Use the doc's title instead
    pageTitle = doc.title;
    canonicalURL += doc.mdn_url;

    const documentDataTag = `<script>window.__data__ = JSON.parse(${serializeDocumentData(
      doc
    )});</script>`;
    $("#root").after(documentDataTag);
  }

  $('link[rel="canonical"]').attr("href", canonicalURL);

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
