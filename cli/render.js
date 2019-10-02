const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { renderToString } = require("react-dom/server");

function readBuildHtml() {
  return fs.readFileSync(
    path.resolve(__dirname, "../client/dist/index.html"),
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

module.exports = (renderApp, options) => {
  if (process.env.NODE_ENV === "development") {
    // Reread on every request
    buildHtml = readBuildHtml();
  }
  const $ = cheerio.load(buildHtml);

  const rendered = renderToString(renderApp);

  let pageTitle = "MDN Web Docs"; // default

  const { doc } = options;

  if (doc) {
    // Use the doc's title instead
    pageTitle = doc.title;

    // XXX We *could* just expose some absolute minimal here. Just enough
    // for the React Document component to know it doesn't need to re-render.
    const escapeDocumentJson = JSON.stringify(doc).replace("</", "<\\/");
    const documentDataTag = `
    <script id="documentdata" type="application/json">${escapeDocumentJson}</script>
    `.trim();
    $("#root").after(documentDataTag);
  }

  $("title").text(pageTitle);

  $("#root").html(rendered);

  // Every script tag that create-react-app inserts, make them defer
  $("body script[src]").attr("defer", "");

  return $.html();
};
