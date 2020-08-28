/**
 * Utility functions are collected here. These are functions that are used
 * by the exported functions below. Some of them are themselves exported.
 *
 * @prettier
 */
const cssesc = require("cssesc");
const sanitizeFilename = require("sanitize-filename");

const cheerio = require("../monkeypatched-cheerio.js");

const H1_TO_H6_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const HEADING_TAGS = new Set([...H1_TO_H6_TAGS, "hgroup"]);
const INJECT_SECTION_ID_TAGS = new Set([...HEADING_TAGS, "section"]);
const LIVE_SAMPLE_PARTS = ["html", "css", "js"];
const SECTION_ID_DISALLOWED = /["#$%&+,/:;=?@[\]\^`{|}~')(\\]/g;

class KumascriptError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

function slugify(text) {
  // Turn the text content of a header, or the value of the "name" attribute,
  // into a slug for use as an ID as well as a filename. Trim it, collapse
  // whitespace gaps into underscores, remove the same special characters that
  // Kuma removes (for consistency, since for example many live-samples depend
  // on this), and finally remove any remaining characters that would not work
  // within a filename on a Windows, Mac OS X, or Unix filesystem.
  // NOTE: These are the constraints that have to be satisfied:
  //    1) the result can be used as a filename on Windows, Mac OS X, and Unix
  //       (this is why the "sanitize-filename" npm package is used)
  //    2) the result will be used as an "id" attribute, so in HTML5 it must
  //       contain at least one character and must not contain any whitespace
  //       characters (the "sanitize-filename" npm package will itself remove
  //       spaces, but since they're useful in breaking up phrases, before we
  //       run "sanitize-filename" we convert whitespace gaps into underscores)
  //    3) many macros use sample ID's that assume that "id" attributes have
  //       had the SECTION_ID_DISALLOWED characters removed, so for now we have
  //       to maintain that legacy
  //    4) there's no need to add constraints that assume the result will be
  //       used as a CSS ID selector, since it will be properly escaped for that
  //       use case (see the "cssesc" code within the "getSection" method of the
  //       HTMLTool below)
  return sanitizeFilename(
    text.trim().replace(SECTION_ID_DISALLOWED, "").replace(/\s+/g, "_")
  );
}

function spacesToUnderscores(text) {
  return text.replace(/ |%20/g, "_");
}

function safeDecodeURIComponent(text) {
  // This function will attempt to URI-decode the incoming text, which may
  // or may not be URI-encoded, and if it can't, it assumes the text is not
  // URI-encoded and simply falls back to using the text itself. This exists
  // solely because some localized pages URI-encode the sample ID argument
  // to their "EmbedLiveSample" macro calls, and we need to run the non-URI-
  // encoded sample ID through "slugify()" above prior to URI-encoding it
  // for the live-sample URL.
  try {
    return decodeURIComponent(text);
  } catch (e) {
    return text;
  }
}

class HTMLTool {
  constructor(html, pathDescription) {
    this.$ = cheerio.load(html, { decodeEntities: true });
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
      if (e.attribs.name && INJECT_SECTION_ID_TAGS.has(e.tagName)) {
        knownIDs.add(slugify(e.attribs.name));
      } else if (e.attribs.id && !H1_TO_H6_TAGS.has(e.tagName)) {
        knownIDs.add(e.attribs.id);
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

  getSection(section) {
    const $ = this.$;
    // This is important since many macros specify the section ID with spaces,
    // and/or characters that are stripped from the actual ID's (e.g., "(" and ")").
    const sectionID = slugify(section);
    // Kuma looks for the first HTML tag of a limited set of section tags with ANY
    // attribute equal to the "sectionID", but in practice it's always an "id" attribute,
    // so let's simplify this as well as make it much faster.
    const sectionStart = $(`#${cssesc(sectionID, { isIdentifier: true })}`);
    if (!sectionStart.length) {
      throw new KumascriptError(
        `unable to find an HTML element with an "id" of "${sectionID}" within ${this.pathDescription}`
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
    return result;
  }

  extractSection(section) {
    const result = this.getSection(section).not(".noinclude");
    return cheerio.html(result);
  }

  extractLiveSampleObject(sampleID) {
    const result = Object.create(null);
    const sample = this.getSection(sampleID);
    // We have to wrap the collection of elements from the section
    // we've just aquired because we're going to search among all
    // descendants and we want to include the elements themselves
    // as well as their descendants.
    const $ = cheerio.load(`<div>${cheerio.html(sample)}</div>`);
    for (const part of LIVE_SAMPLE_PARTS) {
      const src = $(
        `.${part},pre[class*="brush:${part}"],pre[class*="${part};"]`
      ).text();
      // The string replacements below have been carried forward from Kuma:
      //   * Bugzilla 819999: &nbsp; gets decoded to \xa0, which trips up CSS.
      //   * Bugzilla 1284781: &nbsp; is incorrectly parsed on embed sample.
      result[part] = src
        ? src.replace("\xa0", " ").replace("&nbsp;", " ")
        : null;
    }
    if (!LIVE_SAMPLE_PARTS.some((part) => result[part])) {
      throw new KumascriptError(
        `unable to find any live code samples for "${sampleID}" within ${this.pathDescription}`
      );
    }
    return result;
  }

  html() {
    // Cheerio will always replace all `&nbsp;` with a `\xa0` (`\u00a0`)
    // when you serialize the `.html()` or the `.text()`. This is
    // independent of decoding entities.
    return this.$.html().replace(/\u00a0/g, " ");
  }
}

// Utility functions are collected here. These are functions that are used
// by the exported functions below. Some of them are themselves exported.
module.exports = {
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
    return spacesToUnderscores(path);
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

  safeDecodeURIComponent,

  spacesToUnderscores,

  slugify,

  HTMLTool,

  KumascriptError,
};
