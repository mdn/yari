/**
 * @prettier
 */
import url from "url";

import util from "./util.js";

export default {
  /**
   * Expose url from node.js to templates
   */
  url,
  htmlEscape: util.htmlEscape,
};
