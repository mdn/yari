const ejs = require("ejs");

const Parser = require("./parser.js");
const { MacroLiveSampleError } = require("./errors.js");
const { normalizeMacroName } = require("./render.js");
const {
  HTMLTool,
  slugify,
  safeDecodeURIComponent,
  KumascriptError,
} = require("./api/util.js");

const LIVE_SAMPLE_HTML = `
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="robots" content="noindex, nofollow">
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

function buildLiveSamplePage(uri, title, source, sampleIDObject) {
  // Given the URI, title, and rendered HTML of a document, build
  // and return the HTML of the live-sample page for the given
  // sampleID that this document or another references, or else
  // return an instance of MacroLiveSampleError.
  const result = { html: null, flaw: null };
  const tool = new HTMLTool(source, uri);
  let sampleData;
  try {
    sampleData = tool.extractLiveSampleObject(sampleIDObject.id);
  } catch (e) {
    if (e instanceof KumascriptError) {
      result.flaw = sampleIDObject.createFlaw(e);
      return result;
    }
    throw e;
  }
  sampleData.sampleTitle = `${title} - ${sampleIDObject.id} - code sample`;
  result.html = liveSampleTemplate(sampleData);
  return result;
}

function normalizeSlug(slug) {
  // Trim the slug, remove all leading and trailing forward
  // slashes, and convert to lower case.
  return slug
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase();
}

class LiveSampleID {
  constructor(id, source, token) {
    this.id = id;
    this.source = source;
    this.token = token;
  }

  createFlaw(message) {
    return new MacroLiveSampleError(
      message instanceof Error ? message : new Error(message),
      this.source,
      this.token
    );
  }
}

function getLiveSampleIDs(slug, source) {
  // Given a slug and its raw source HTML, parses the source and returns
  // a list of live-sample ID's to be extracted from this document.
  const tokens = Parser.parse(source);
  const currentSlug = normalizeSlug(slug);
  // Loop through the tokens, looking for calls to the EmbedLiveSample macro.
  // The first argument to the call is the live-sample ID, and there may also
  // be an optional fifth argument that specifies a slug, that may or may not
  // be different from the current slug, from which to extract the sample ID.
  const result = [];
  for (const token of tokens) {
    if (token.type !== "MACRO") continue;
    const normalizedMacroName = normalizeMacroName(token.name);
    if (normalizedMacroName === "inheritancediagram") {
      // The InheritanceDiagram is a special macro that, unlike other EmbedLiveSample
      // macros in that it itself renders the "EmbedLiveSample" with a set of
      // hardcoded options. The only thing that is variable and comes from the
      // the raw HTML is the size. So make an exception for this otherwise, the
      // HTML element ID is lost and this function won't discovered that it is
      // in fact a live sample here.
      result.push(new LiveSampleID("inheritance_diagram", source, token));
    } else if (
      (normalizedMacroName === "embedlivesample" ||
        normalizedMacroName === "livesamplelink") &&
      token.args.length
    ) {
      // Some of the localized pages URI-encode their first argument,
      // the live-sample ID, even though they don't need to do that,
      // so let's first call "safeDecodeURIComponent" just in case.
      const sampleID = slugify(safeDecodeURIComponent(token.args[0]));
      const sampleIDObject = new LiveSampleID(sampleID, source, token);
      if (token.args.length > 4) {
        // Some calls to EmbedLiveSample explicitly specify a slug from which
        // to extract the live sample ID in the 5th argument (4th index), so
        // we can't just assume that all of the sample ID's are to be extracted
        // from the current document.
        const slugArg = normalizeSlug(token.args[4]);
        if (slugArg && slugArg !== currentSlug) {
          // If this live-sample is to be extracted from another document,
          // don't return it as part of this document's list of sample ID's.
          continue;
        }
      }
      result.push(sampleIDObject);
    }
  }
  return result;
}

module.exports = { buildLiveSamplePage, getLiveSampleIDs };
