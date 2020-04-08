/**
 * Utility functions are collected here. These are functions that are used
 * by the exported functions below. Some of them are themselves exported.
 *
 * @prettier
 */
const url = require("url");

const cache = require("../cache.js");
const config = require("../config.js");

// Utility functions are collected here. These are functions that are used
// by the exported functions below. Some of them are themselves exported.
const util = (module.exports = {
  // Fill in undefined properties in object with values from the
  // defaults objects, and return the object. As soon as the property is
  // filled, further defaults will have no effect.
  //
  // Stolen from http://underscorejs.org/#defaults
  defaults(obj, ...sources) {
    for (let source of sources) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  },

  /**
   * Prepares the provided path by looking for legacy paths that
   * need to be prefixed by "/en-US/docs", as well as ensuring
   * it starts with a "/" and replacing its spaces (whether
   * encoded or not) with underscores.
   */
  preparePath(path) {
    if (path.charAt(0) != "/") {
      path = "/" + path;
    }
    if (path.indexOf("/docs") == -1) {
      // HACK: If this looks like a legacy wiki URL, throw /en-US/docs
      // in front of it. That will trigger the proper redirection logic
      // until/unless URLs are corrected in templates
      path = "/en-US/docs" + path;
    }
    return path.replace(/ |%20/gi, "_");
  },

  // Given a path, attempt to construct an absolute URL to the wiki.
  buildAbsoluteURL(path) {
    return util.apiURL(util.preparePath(path));
  },

  /**
   * Build an absolute URL from the given "path" that uses the
   * protocol and host of the document service rather than those
   * of the public-facing website. If the "path" argument is an
   * absolute URL, everything will be discarded except its "path"
   * and "hash" attributes (as defined by "url.parse()"). If the
   * "path" argument is not provided or is falsy, the base URL of
   * the document service will be returned.
   *
   * @param {string} path;
   */
  apiURL(path) {
    if (!path) {
      return config.documentURL;
    }
    let parts = url.parse(encodeURI(path));
    path = parts.path + (parts.hash ? parts.hash : "");
    return url.resolve(config.documentURL, path);
  },

  /**
   * #### htmlEscape(string)
   * Escape the given string for HTML inclusion.
   *
   * @param {string} s
   * @return {string}
   */
  htmlEscape(s) {
    return ("" + s)
      .replace(/&/g, "&amp;")
      .replace(/>/g, "&gt;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  },

  escapeQuotes(a) {
    var b = "";
    for (var i = 0, len = a.length; i < len; i++) {
      var c = a[i];
      if (c == '"') {
        c = "&quot;";
      }
      b += c;
    }
    return b.replace(/(<([^>]+)>)/gi, "");
  },

  spacesToUnderscores(str) {
    var re1 = / /gi;
    var re2 = /%20/gi;
    str = str.replace(re1, "_");
    return str.replace(re2, "_");
  }
});
