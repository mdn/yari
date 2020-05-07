/**
 * Utility functions are collected here. These are functions that are used
 * by the exported functions below. Some of them are themselves exported.
 *
 * @prettier
 */
const url = require("url");

const config = require("../config.js");
const cheerio = require("../monkeypatched-cheerio.js");

const URL_UNSAFE = /["#$%&+,/:;=?@\[\]^`{}|~'()]/g;

const H1_TO_H6_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const HEADING_TAGS = new Set([...H1_TO_H6_TAGS, "hgroup"]);
const INJECT_SECTION_ID_TAGS = new Set([...HEADING_TAGS, "section"]);

function slugify(text) {
  // Turn the text content of a header into a slug for use in an ID.
  // Remove unsafe characters, and collapse whitespace gaps into
  // underscores.
  return text.replace(URL_UNSAFE, "").trim().replace(/\s+/g, "_");
}

class HTMLTool {
  constructor(html, pathDescription) {
    this.$ = cheerio.load(html);
    this.pathDescription = pathDescription;
  }

  removeNoIncludes() {
    this.$(".noinclude").remove();
    return this;
  }

  removeOnEventHandlers() {
    // Remove ALL on-event handlers.
    this.$("*").each((i, e) => {
      // Since "e.attribs" is an object with a "null"
      // prototype, "key in e.attribs" is equivalent to
      // "key of Object.keys(e.attribs)" since we don't
      // have to worry about keys from the prototype.
      for (const key in e.attribs) {
        if (key.startsWith("on")) {
          delete e.attribs[key];
        }
      }
    });
    return this;
  }

  injectSectionIDs() {
    let idCount = 0;
    const $ = this.$;
    const knownIDs = new Set();

    function generateUniqueID() {
      let id;
      do {
        id = `sect${++idCount}`;
      } while (knownIDs.has(id));
      knownIDs.add(id);
      return id;
    }

    // First, let's gather the known ID's.
    $("[id],[name]").each((i, e) => {
      if (e.attribs.id && !H1_TO_H6_TAGS.has(e.tagName)) {
        knownIDs.add(e.attribs.id);
      }
      if (e.attribs.name) {
        knownIDs.add(e.attribs.name);
      }
    });

    // Now, let's inject section ID's.
    $([...INJECT_SECTION_ID_TAGS].join(",")).each((i, e) => {
      if (e.attribs.name) {
        // The "name" attribute overrides any current "id".
        e.attribs["id"] = slugify(e.attribs.name);
      } else if (H1_TO_H6_TAGS.has(e.tagName)) {
        // For heading tags, we'll give them an "id" that's a
        // slugified version of their text content.
        const text = $(e).text();
        let id = slugify(text);
        if (id) {
          // Ensure that the slugified "id" has not already been
          // taken. If it has, create a unique version of it.
          let version = 2;
          const originalID = id;
          while (knownIDs.has(id)) {
            id = `${originalID}_${version++}`;
          }
          knownIDs.add(id);
        } else {
          // Auto-generate a unique "id" as a last resort.
          id = generateUniqueID();
        }
        e.attribs["id"] = id;
      } else if (!e.attribs.id) {
        // Any "section" and "hgroup" tags without an "id" get an
        // auto-generated one.
        e.attribs["id"] = generateUniqueID();
      }
    });
    return this;
  }

  extractSection(section) {
    const $ = this.$;
    // This is important since many macros specify the section ID with spaces.
    const sectionID = section.replace(/ |%20/g, "_");
    // Kuma looks for the first HTML tag of a limited set of section tags with ANY
    // attribute equal to the "sectionID", but in practice it's always an "id" attribute,
    // so let's simplify this as well as make it much faster.
    const sectionStart = $(`#${sectionID}`);
    if (!sectionStart.length) {
      throw new Error(
        `unable to find section "${sectionID}" within ${this.pathDescription}`
      );
    }
    let result;
    const sectionTag = sectionStart.get(0).tagName;
    if (HEADING_TAGS.has(sectionTag)) {
      // Heading-based sections comprise the start and all siblings
      // after the start until the beginning of the next section of
      // equal or higher level. For example, if the section starts
      // with an "h3", take the "h3" and all of the following sibling
      // elements until either there are no more siblings or we reach
      // an "h1", "h2", or another "h3" element.
      const nextSection = [...HEADING_TAGS]
        .filter((tag) => tag <= sectionTag || tag === "hgroup")
        .join(",");
      result = sectionStart.add(sectionStart.nextUntil(nextSection));
    } else {
      // Non-heading-based sections comprise all of the children of
      // the starting element, but not the starting element itself.
      result = sectionStart.children();
    }
    result = result.not(".noinclude");
    return $.html(result);
  }

  html() {
    return this.$.html();
  }
}

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
  },

  HTMLTool,
});
