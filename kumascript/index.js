const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");
const {
  getLiveSampleIDs,
  buildLiveSamplePage,
} = require("./src/live-sample.js");
const { HTMLTool, KumascriptError } = require("./src/api/util.js");

class Renderer {
  constructor({
    liveSamplesBaseUrl = null,
    interactiveExamplesBaseUrl = null,
    uriTransform = (uri) => uri,
  } = {}) {
    this.allPagesInfo = null;
    this.uriTransform = uriTransform;
    this.liveSamplesBaseUrl = liveSamplesBaseUrl;
    this.interactiveExamplesBaseUrl = interactiveExamplesBaseUrl;
    this.templates = new Templates();
  }

  checkAllPagesInfo() {
    if (!this.allPagesInfo) {
      throw new Error(
        `You haven't yet specified the context for the render via Renderer().use(pageInfoByUri).`
      );
    }
  }

  use(pageInfoByUri) {
    this.allPagesInfo = new AllPagesInfo(pageInfoByUri, this.uriTransform);
    return this;
  }

  clearCache() {
    this.allPagesInfo.clearCache();
  }

  async render(source, pageEnvironment, cacheResult = false) {
    this.checkAllPagesInfo();
    const uri = pageEnvironment.path.toLowerCase();
    const cachedResult = this.allPagesInfo.getResultFromCache(uri);
    if (cachedResult) {
      return cachedResult;
    }
    const [renderedHtml, errors] = await renderMacros(
      source,
      this.templates,
      {
        ...pageEnvironment,
        interactive_examples: {
          base_url: this.interactiveExamplesBaseUrl,
        },
        live_samples: { base_url: this.liveSamplesBaseUrl },
      },
      this.allPagesInfo
    );

    // For now, we're just going to inject section ID's.
    // TODO: Sanitize the HTML and also filter the "src"
    //       attributes of any iframes.
    const tool = new HTMLTool(renderedHtml);
    tool.injectSectionIDs();
    const result = [tool.html(), errors];

    if (cacheResult) {
      this.allPagesInfo.cacheResult(uri, result);
    }
    return result;
  }
}

module.exports = {
  buildLiveSamplePage,
  getLiveSampleIDs,
  getPrerequisites,
  KumascriptError,
  Renderer,
};
