const Document = require("content/scripts/document");

const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");
const {
  getLiveSampleIDs,
  buildLiveSamplePage,
  LiveSampleError,
} = require("./src/live-sample.js");
const { HTMLTool } = require("./src/api/util.js");

async function renderFromURL(url, config) {
  const {
    interactiveExamplesBaseUrl,
    liveSamplesBaseUrl,
    uriTransform,
  } = config;
  const { rawHtml, metadata } = Document.findByURL(url).document;
  const [renderedHtml, errors] = await renderMacros(
    rawHtml,
    new Templates(),
    {
      ...{
        path: url,
        url: `${"this.options.sitemapBaseUrl"}${url}`,
        locale: metadata.locale,
        slug: metadata.slug,
        title: metadata.title,
        tags: metadata.tags || [],
        selective_mode: false,
      },
      interactive_examples: {
        base_url: interactiveExamplesBaseUrl,
      },
      live_samples: { base_url: liveSamplesBaseUrl },
    },
    new AllPagesInfo(uriTransform),
    (url) => renderFromURL(url, config)
  );

  // For now, we're just going to inject section ID's.
  // TODO: Sanitize the HTML and also filter the "src"
  //       attributes of any iframes.
  const tool = new HTMLTool(renderedHtml);
  tool.injectSectionIDs();
  return [tool.html(), errors];
}

module.exports = {
  buildLiveSamplePage,
  getLiveSampleIDs,
  getPrerequisites,
  LiveSampleError,
  render: renderFromURL,
};
