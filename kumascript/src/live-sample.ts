import cheerio from "cheerio";
import ejs from "ejs";

import { MacroLiveSampleError } from "./errors";
import { HTMLTool, KumascriptError, slugify } from "./api/util";

const LIVE_SAMPLE_HTML = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
        <style>
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
        <style>
            <%- css %>
        </style>
        <% } %>
        <title><%= sampleTitle %></title>
        <% if (hasMathML) { %>
          <link rel="stylesheet" href="https://fred-wang.github.io/MathFonts/STIX/mathfonts.css" />
          <script src="https://fred-wang.github.io/mathml.css/mspace.js"></script>
        <% } %>
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

export function buildLiveSamplePages(uri, title, $, rawBody) {
  // Given the URI, title, and rendered HTML of a document, build
  // and return the HTML of the live-sample pages for the given
  // document or else collect flaws
  if (typeof $ == "string") {
    $ = cheerio.load($);
  }
  return $("iframe")
    .filter((i, iframe) => {
      const src = $(iframe).attr("src");
      return (
        src && src.toLowerCase().includes(`${uri.toLowerCase()}/_sample_.`)
      );
    })
    .map((i, iframe) => {
      const iframeId = $(iframe).attr("id");
      const id = slugify(iframeId.substr("frame_".length));
      const result = { id, html: null, flaw: null };
      const tool = new HTMLTool($, uri);
      let sampleData;
      try {
        sampleData = tool.extractLiveSampleObject(iframeId);
      } catch (error) {
        if (error instanceof KumascriptError) {
          result.flaw = new MacroLiveSampleError(
            error,
            rawBody,
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
