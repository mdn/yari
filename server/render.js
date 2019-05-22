import React from "react";
import { renderToString } from "react-dom/server";
import escape from "escape-html";

const fs = require("fs");
const path = require("path");

function readBuildHtml() {
  return fs.readFileSync(
    path.resolve(__dirname, "../../client/build/index.html"),
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

export default (renderApp, options = {}) => {
  console.log(options);
  //   const song = options.song || null;
  //   const related = options.related || null;
  //   const results = options.results || null;
  //   const songNotFound = options.songNotFound || false;
  //   const pageNotFound = options.pageNotFound || false;
  //   const totalStats = options.totalStats || null;
  //   const searchExamples = options.searchExamples || null;

  if (process.env.NODE_ENV === "development") {
    // Reread on every request
    buildHtml = readBuildHtml();
  }

  const rendered = renderToString(renderApp);
  let pageTitle = "MDN Web Docs";
  let outHtml = buildHtml;
  outHtml = outHtml.replace(
    "<title>MDN Web Docs</title>",
    `<title>${escape(pageTitle)}</title>`
  );
  return outHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${rendered}</div>`
  );
};
