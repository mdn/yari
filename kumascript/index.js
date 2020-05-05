const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");
const { MacroExecutionError } = require("./src/errors.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");

class Renderer {
  constructor({ uriTransform = (uri) => uri } = {}) {
    this.allPagesInfo = null;
    this.uriTransform = uriTransform;
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
    const result = await renderMacros(
      source,
      this.templates,
      pageEnvironment,
      this.allPagesInfo
    );

    if (cacheResult) {
      this.allPagesInfo.cacheResult(uri, result);
    }
    return result;
  }
}

module.exports = {
  getPrerequisites,
  Renderer,
};
