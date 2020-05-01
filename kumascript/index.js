const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");
const { MacroExecutionError } = require("./src/errors.js");
const { getPrerequisites, render: renderMacros } = require("./src/render.js");

class Renderer {
  constructor({
    uriTransform = (uri) => uri,
    throwErrorsOnFlaws = false,
  } = {}) {
    this.allPagesInfo = null;
    this.uriTransform = uriTransform;
    this.throwErrorsOnFlaws = throwErrorsOnFlaws;
    this.templates = new Templates();
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
    this.allPagesInfo.clearRenderedHtmlCache();
  }

  recordFlaw(message, caller, context) {
    const fullMessage = `${caller}: ${message}`;
    const error = new Error(fullMessage);
    if (this.throwErrorsOnFlaws) {
      // This sacrifices further work on rendering the current macro
      // for the potential benefit of a better stack trace. The error
      // will be caught and pushed onto the flaws of the current
      // document being rendered, within the "render" method below.
      throw error;
    }
    // This path is more forgiving, in the sense that we'll record the
    // flaw but also keep trying to render the current macro within the
    // current document.
    const flaw = new MacroExecutionError(
      error,
      context.parsingInfo.source,
      context.parsingInfo.token
    );
    const docUri = context.path.toLowerCase();
    this.pushFlaw(docUri, flaw);
  }

  pushFlaw(uri, flaw) {
    if (this.flaws.has(uri)) {
      this.flaws.get(uri).push(flaw);
    } else {
      this.flaws.set(uri, [flaw]);
    }
  }

  async render(source, pageEnvironment, cacheResult = false) {
    this.checkAllPagesInfo();
    const uri = pageEnvironment.path.toLowerCase();
    const cachedResult = this.allPagesInfo.getRenderedHtmlFromCache(uri);
    if (cachedResult) {
      return cachedResult;
    }
    const [result, errors] = await renderMacros(
      source,
      this.templates,
      pageEnvironment,
      this.allPagesInfo
    );
    for (const error of errors) {
      this.pushFlaw(uri, error);
    }
    if (cacheResult) {
      this.allPagesInfo.cacheRenderedHtml(uri, result);
    }
    return result;
  }
}

module.exports = {
  getPrerequisites,
  Renderer,
};
