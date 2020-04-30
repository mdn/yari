const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");
const { MacroExecutionWarning } = require("./src/errors.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");

class Renderer {
  constructor({
    uriTransform = (uri) => uri,
    convertFlawsToErrors = false,
  } = {}) {
    this.allPagesInfo = null;
    this.uriTransform = uriTransform;
    this.convertFlawsToErrors = convertFlawsToErrors;
    this.templates = new Templates();
    this.errors = new Map();
    this.flaws = new Map();
  }

  checkAllPagesInfo() {
    if (!this.allPagesInfo) {
      throw new Error(
        `You haven't yet specified the context for the render via Renderer().use(pageInfoByUri).`
      );
    }
  }

  use(pageInfoByUri) {
    this.allPagesInfo = new AllPagesInfo(pageInfoByUri, this);
    return this;
  }

  clearCache() {
    this.flaws.clear();
    this.errors.clear();
    this.allPagesInfo.clearRenderedHtmlCache();
  }

  recordFlaw(message, caller, context) {
    const fullMessage = `${caller}: ${message}`;
    if (this.convertFlawsToErrors) {
      throw new Error(fullMessage);
    }
    const flaw = new MacroExecutionWarning(
      fullMessage,
      context.parsingInfo.source,
      context.parsingInfo.token
    );
    const docUri = context.path.toLowerCase();
    if (this.flaws.has(docUri)) {
      this.flaws.get(docUri).push(flaw);
    } else {
      this.flaws.set(docUri, [flaw]);
    }
  }

  async render(source, pageEnvironment, cacheResult = false) {
    this.checkAllPagesInfo();
    const uri = pageEnvironment.path.toLowerCase();
    const cachedResult = this.allPagesInfo.getRenderedHtmlFromCache(uri);
    if (cachedResult) {
      const cachedErrors = this.errors.get(uri) || [];
      return { renderedHtml: cachedResult, errors: cachedErrors };
    }
    const [result, errors] = await renderMacros(
      source,
      this.templates,
      pageEnvironment,
      this.allPagesInfo
    );
    if (errors.length) {
      this.errors.set(uri, errors);
    } else {
      this.errors.delete(uri);
    }
    if (cacheResult) {
      this.allPagesInfo.cacheRenderedHtml(uri, result);
    }
    return { renderedHtml: result, errors };
  }
}

module.exports = {
  getPrerequisites,
  Renderer,
};
