/**
 * @prettier
 */
const url = require("url");
const util = require("./util.js");

module.exports = {
  /**
   * Expose url from node.js to templates
   */
  url,
  htmlEscape: util.htmlEscape,
};
