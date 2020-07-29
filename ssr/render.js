import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { renderToString } from "react-dom/server";

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

  // Move the script tags from the body to the head.
  // That way the browser can notice, and start downloading these files sooner
  // but they'll still be executed after the first render.
  $("body script[src]").appendTo("head");
  $("body script[src]").remove();

  return $.html();
}
