import url from "node:url";
import * as util from "./util";

const kuma = {
  /**
   * Expose url from node.js to templates
   */
  url,
  htmlEscape: util.htmlEscape,
};

export default kuma;
