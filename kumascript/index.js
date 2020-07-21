const { Document, memoize } = require("content");

const {
  INTERACTIVE_EXAMPLES_BASE_URL,
  LIVE_SAMPLES_BASE_URL,
} = require("./src/constants");
const Templates = require("./src/templates.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");
const {
  getLiveSampleIDs,
  buildLiveSamplePage,
  LiveSampleError,
} = require("./src/live-sample.js");
const { HTMLTool } = require("./src/api/util.js");

const renderFromURL = memoize(async (url) => {
  const { rawHtml, metadata } = Document.findByURL(url).document;
  const [renderedHtml, errors] = await renderMacros(
    rawHtml,
    new Templates(),
    {
      ...{
        path: url,
        url: `https://developer.mozilla.org${url}`,
        locale: metadata.locale,
        slug: metadata.slug,
        title: metadata.title,
        tags: metadata.tags || [],
        selective_mode: false,
      },
      interactive_examples: {
        base_url: INTERACTIVE_EXAMPLES_BASE_URL,
      },
      live_samples: { base_url: LIVE_SAMPLES_BASE_URL },
    },
    (url) => renderFromURL(url)
  );

  // For now, we're just going to inject section ID's.
  // TODO: Sanitize the HTML and also filter the "src"
  //       attributes of any iframes.
  const tool = new HTMLTool(renderedHtml);
  tool.injectSectionIDs();
  return [tool.html(), errors];
});

module.exports = {
  buildLiveSamplePage,
  getLiveSampleIDs,
  getPrerequisites,
  LiveSampleError,
  render: renderFromURL,
};
