const { Document, memoize } = require("../content");

const {
  INTERACTIVE_EXAMPLES_BASE_URL,
  LIVE_SAMPLES_BASE_URL,
} = require("./src/constants");
const info = require("./src/info.js");
const { render: renderMacros } = require("./src/render.js");
const {
  getLiveSampleIDs,
  buildLiveSamplePage,
  LiveSampleError,
} = require("./src/live-sample.js");
const { HTMLTool } = require("./src/api/util.js");

const renderCache = new Map();

const renderFromURL = async (url, depth = new Map()) => {
  const cleanURL = info.cleanURL(url);
  if ((depth.get(cleanURL) || 0) > 1) {
    throw new Error("TOOO DEEP!");
  }
  if (renderCache.has(cleanURL)) {
    return renderCache.get(cleanURL);
  }

  const prerequisiteErrorsByKey = new Map();
  const document = Document.findByURL(url);
  if (!document) {
    throw new Error(
      `From URL ${url} no folder on disk could be found. ` +
        `Tried to find a folder called ${Document.urlToFolderPath(url)}`
    );
  }
  const { rawHTML, metadata, fileInfo } = document;
  const [renderedHtml, errors] = await renderMacros(
    rawHTML,
    {
      ...{
        url,
        locale: metadata.locale,
        slug: metadata.slug,
        title: metadata.title,
        tags: metadata.tags || [],
        selective_mode: false,
      },
      interactive_examples: {
        base_url: INTERACTIVE_EXAMPLES_BASE_URL,
      },
      live_samples: { base_url: LIVE_SAMPLES_BASE_URL || url },
    },
    async (url) => {
      const cleanURL = info.cleanURL(url);
      if (!renderCache.has(cleanURL)) {
        depth.set(cleanURL, (depth.get(cleanURL) || 0) + 1);
        renderCache.set(cleanURL, await renderFromURL(cleanURL, depth));
      }

      const [renderedHtml, errors] = renderCache.get(cleanURL);
      // Remove duplicate flaws. During the rendering process, it's possible for identical
      // flaws to be introduced when different dependency paths share common prerequisites.
      // For example, document A may have prerequisite documents B and C, and in turn,
      // document C may also have prerequisite B, and the rendering of document B generates
      // one or more flaws.
      for (const error of errors) {
        prerequisiteErrorsByKey.set(error.key, error);
      }
      return renderedHtml;
    }
  );

  // For now, we're just going to inject section ID's.
  // TODO: Sanitize the HTML and also filter the "src"
  //       attributes of any iframes.
  const tool = new HTMLTool(renderedHtml);
  tool.injectSectionIDs();
  renderCache.set(cleanURL, [
    tool.html(),
    // The prerequisite errors have already been updated with their own file information.
    [...prerequisiteErrorsByKey.values()].concat(
      errors.map((e) => e.updateFileInfo(fileInfo))
    ),
  ]);
  return renderCache.get(cleanURL);
};

module.exports = {
  buildLiveSamplePage,
  getLiveSampleIDs,
  LiveSampleError,
  render: renderFromURL,
  renderCache,
};
