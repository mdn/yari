import fs from "fs";
import path from "path";

import jsesc from "jsesc";
import cheerio from "cheerio";
import { renderToString } from "react-dom/server";

function readBuildHtml() {
  return fs.readFileSync(
    path.resolve(__dirname, "../../client/build/index.html"),
    "utf8"
  );
}

function serializeDocumentData(data) {
  return jsesc(JSON.stringify(data), {
    json: true,
    isScriptContext: true,
  });
}

let buildHtml = "";
if (process.env.NODE_ENV !== "development") {
  // read it once
  buildHtml = readBuildHtml();
  if (!buildHtml.includes('<div id="root"></div>')) {
    throw new Error(
      'The render depends on being able to inject into <div id="root"></div>'
    );
  }
}

export default function render(renderApp, doc) {
  if (process.env.NODE_ENV === "development") {
    // Reread on every request
    buildHtml = readBuildHtml();
  }
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
