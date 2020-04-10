const renderMacros = require("./src/render.js");
const Templates = require("./src/templates.js");
const AllPagesInfo = require("./src/info.js");

class Renderer {
  constructor() {
    this.allPagesInfo = null;
    this.templates = new Templates();
  }

  use(pageInfoByUri) {
    this.allPagesInfo = new AllPagesInfo(pageInfoByUri);
    return this;
  }

  async render(source, pageEnvironment) {
    if (!this.allPagesInfo) {
      throw new Error(
        `You haven't yet specified the context for the render via Renderer().use(pageInfoByUri).`
      );
    }
    return renderMacros(
      source,
      this.templates,
      pageEnvironment,
      this.allPagesInfo
    );
  }
}

module.exports = Renderer;
