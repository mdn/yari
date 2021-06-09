const cheerio = require("cheerio");
const ejs = require("ejs");

const { MacroLiveSampleError } = require("./errors.js");
const { HTMLTool, KumascriptError } = require("./api/util.js");

const LIVE_SAMPLE_HTML = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <style type="text/css">
            body {
              padding: 0;
              margin: 0;
            }

            svg:not(:root) {
              display: block;
            }

            .playable-code {
              background-color: #f4f7f8;
              border: none;
              border-left: 6px solid #558abb;
              border-width: medium medium medium 6px;
              color: #4d4e53;
              height: 100px;
              width: 90%;
              padding: 10px 10px 0;
            }

            .playable-canvas {
              border: 1px solid #4d4e53;
              border-radius: 2px;
            }

            .playable-buttons {
              text-align: right;
              width: 90%;
              padding: 5px 10px 5px 26px;
            }
        </style>
        <% if (css) { %>
        <style type="text/css">
            <%- css %>
        </style>
        <% } %>
        <title><%= sampleTitle %></title>
    </head>
    <body>
        <% if (html) { %>
            <%- html %>
        <% } %>
        <% if (js) { %>
            <script>
                <%- js %>
            </script>
        <% } %>
    </body>
</html>`.trim();

const liveSampleTemplate = ejs.compile(LIVE_SAMPLE_HTML);

function buildLiveSamplePages(uri, title, renderedHTML) {
  // Given the URI, title, and rendered HTML of a document, build
  // and return the HTML of the live-sample pages for the given
  // document or else collect flaws
  const $ = cheerio.load(renderedHTML);
  return $("iframe")
    .filter((i, iframe) => $(iframe).attr("src").includes("/_sample_."))
    .map((i, iframe) => {
      const iframeId = $(iframe).attr("id");
      const id = iframeId.substr("frame_".length);
      const result = { id, html: null, flaw: null };
      const tool = new HTMLTool(renderedHTML, uri);
      let sampleData;
      try {
        sampleData = tool.extractLiveSampleObject(iframeId);
      } catch (error) {
        if (error instanceof KumascriptError) {
          result.flaw = new MacroLiveSampleError(
            error,
            renderedHTML,
            JSON.parse($(iframe).attr("data-token"))
          );
          return result;
        }
        throw error;
      }
      sampleData.sampleTitle = `${title} - ${id} - code sample`;
      result.html = liveSampleTemplate(sampleData);
      return result;
    })
    .get();
}

module.exports = { buildLiveSamplePages };
