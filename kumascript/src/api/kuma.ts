/**
 * @prettier
 */
const url = require("url");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'util'.
const util = require("./util.js");

module.exports = {
  /**
   * Expose url from node.js to templates
   */
  url,
  htmlEscape: util.htmlEscape,
};
