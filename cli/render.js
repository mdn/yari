import React from "react";
import { renderToString } from "react-dom/server";
import escape from "escape-html";

const fs = require("fs");
const path = require("path");

function readBuildHtml() {
  return fs.readFileSync(
    path.resolve(__dirname, "../../client/build/index.html"),
    // path.resolve(__dirname, "templates/index.html"),
    "utf8"
  );
}

let buildHtml = "";
if (process.env.NODE_ENV !== "development") {
  // read it once
  buildHtml = readBuildHtml();
  if (buildHtml.indexOf('<div id="root"></div>') === -1) {
    throw new Error(
      'The server depends on being able to inject into <div id="root"></div>'
    );
  }
}

export default (renderApp, options) => {
  if (process.env.NODE_ENV === "development") {
    // Reread on every request
    buildHtml = readBuildHtml();
  }

  const rendered = renderToString(renderApp);

  // XXX all of these hack string replaces should be replaced with jsdom
  // or cheerio or something.

  let pageTitle = "MDN Web Docs";
  const { document } = options;
  let outHtml = buildHtml;

  const containerDiv = '<div id="root"></div>';
  if (document) {
    // Use the document's title instead
    pageTitle = document.title;

    // XXX We *could* just expose some absolute minimal here. Just enough
    // for the React Document component to know it doesn't need to re-render.
    const escapeDocumentJson = JSON.stringify(document).replace("</", "<\\/");
    const documentDataTag = `
    <script id="documentdata" type="application/json">${escapeDocumentJson}</script>
    `.trim();

    outHtml = outHtml.replace(
      containerDiv,
      `${containerDiv}\n${documentDataTag}`
    );
  }

  outHtml = outHtml.replace(
    "<title>MDN Web Docs</title>",
    `<title>${escape(pageTitle)}</title>`
  );

  return outHtml.replace(containerDiv, `<div id="root">${rendered}</div>`);
};
