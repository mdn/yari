const renderMacros = require("./src/render.js");
const Templates = require("./src/templates.js");

const templates = new Templates();

async function render(source, pageEnvironment) {
  return renderMacros(source, templates, pageEnvironment);
}

module.exports = render;
