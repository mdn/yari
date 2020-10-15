/**
 * @prettier
 */
const url = require("url");

const util = require("./util.js");

module.exports = {
  //
  // Given a string, escape any quotes within it so it can be
  // passed to other functions.
  //
  escapeQuotes: util.escapeQuotes,

  // Check if the given wiki page exists.
  // This was "temporarily" disabled 7 years ago!
  pageExists(/*path*/) {
    // Temporarily disabling this.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=775590#c4
    return true;
  },

  // Retrieve the content of a document for inclusion,
  // optionally filtering for a single section.
  //
  // Doesn't support the revision parameter offered by DekiScript
  //
  async page(path, section, revision, show, heading) {
    // Adjusts the visibility and heading levels of the specified HTML.
    //
    // The show parameter indicates whether or not the top level
    // heading/title should be displayed. The heading parameter
    // sets the heading level of the top level of the text to the
    // specified value and adjusts all subsequent headings
    // accordingly. This adjustment happens regardless of the
    // value of show.  The heading parameter uses the values 0-5,
    // as did DekiScript, 0 represents a page header or H1, 1 -
    // H2, 2 - H3 etc
    function adjustHeadings(html, section, show, heading) {
      if (html && heading) {
        // Get header level of page or section level
        let level = 1;
        if (section) {
          level = Number(html.match(/^<h(\d)[^>]*>/i)[1]);
        }
        const offset = 1 - level + Number(heading);
        // Change content header levels.
        // There is probably a better way of doing this...
        let re;
        if (offset > 0) {
          for (let i = 6; i >= level; i--) {
            re = new RegExp("(</?h)" + i + "([^>]*>)", "gi");
            html = html.replace(re, "$1" + (i + offset) + "$2");
          }
        } else if (offset < 0) {
          for (let i = level; i <= 6; i++) {
            re = new RegExp("(</?h)" + i + "([^>]*>)", "gi");
            html = html.replace(re, "$1" + (i + offset) + "$2");
          }
        }
      }
      if (show) {
        return html;
      }
      // Rip out the section header
      if (html) {
        html = html.replace(/^<h\d[^>]*>[^<]*<\/h\d>/gi, "") + "";
      }
      return html;
    }

    let result = await this.renderPrerequisiteFromURL(
      this.wiki.ensureExistence(path)
    );
    const pathDescription = this.info.getDescription(path);

    const tool = new util.HTMLTool(result, pathDescription);

    // First, we need to inject section ID's since the section
    // extraction often depends on them.
    tool.injectSectionIDs();
    tool.removeOnEventHandlers();
    tool.removeNoIncludes();

    if (section) {
      result = tool.extractSection(section);
    } else {
      result = tool.html();
    }

    return adjustHeadings(result, section, show || 0, heading);
  },

  // Returns the page object for the specified page.
  getPage(path) {
    return this.info.getPageByURL(path || this.env.url);
  },

  ensureExistence(path) {
    if (!this.info.hasPage(path)) {
      throw new Error(
        `${this.env.url.toLowerCase()} references ${this.info.getDescription(
          path
        )}, which does not exist`
      );
    }
    return path;
  },

  // Build the URI of a given wiki page.
  uri(path, query) {
    var out = util.preparePath(path);
    if (query) {
      out += "?" + query;
    }
    return out;
  },

  // Inserts a pages sub tree
  // if reverse is non-zero, the sort is backward
  // if ordered is true, the output is an <ol> instead of <ul>
  //
  // Special note: If ordered is true, pages whose locale differ from
  // the current page's locale are omitted, to work around misplaced
  // localizations showing up in navigation.
  tree(path, depth, self, reverse, ordered) {
    // If the path ends with a slash, remove it.
    if (path.substr(-1, 1) === "/") {
      path = path.slice(0, -1);
    }

    var pages = this.page.subpages(path, depth, self);

    if (reverse == 0) {
      pages.sort(alphanumForward);
    } else {
      pages.sort(alphanumBackward);
    }

    return process_array(null, pages, ordered != 0, this.env.locale);

    function chunkify(t) {
      var tz = [],
        x = 0,
        y = -1,
        n = 0,
        i,
        j;

      while ((i = (j = t.charAt(x++)).charCodeAt(0))) {
        var m = i == 46 || (i >= 48 && i <= 57);
        if (m !== n) {
          tz[++y] = "";
          n = m;
        }
        tz[y] += j;
      }
      return tz;
    }

    function alphanumForward(a, b) {
      var aa = chunkify(a.title);
      var bb = chunkify(b.title);

      for (let x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
          var c = Number(aa[x]),
            d = Number(bb[x]);
          if (c == aa[x] && d == bb[x]) {
            return c - d;
          } else return aa[x] > bb[x] ? 1 : -1;
        }
      }
      return aa.length - bb.length;
    }

    function alphanumBackward(a, b) {
      var bb = chunkify(a.title);
      var aa = chunkify(b.title);

      for (let x = 0; aa[x] && bb[x]; x++) {
        if (aa[x] !== bb[x]) {
          var c = Number(aa[x]),
            d = Number(bb[x]);
          if (c == aa[x] && d == bb[x]) {
            return c - d;
          } else return aa[x] > bb[x] ? 1 : -1;
        }
      }
      return aa.length - bb.length;
    }

    function process_array(folderItem, arr, ordered, locale) {
      var result = "";
      var openTag = "<ul>";
      var closeTag = "</ul>";

      if (ordered) {
        openTag = "<ol>";
        closeTag = "</ol>";
      }

      if (arr.length) {
        result += openTag;

        // First add an extra item for linking to the folder's page
        // (only for ordered lists)
        if (folderItem != null && ordered) {
          result +=
            '<li><a href="' +
            folderItem.url +
            '">' +
            util.htmlEscape(folderItem.title) +
            "</a></li>";
        }

        // Now dive into the child items

        arr.forEach(function (item) {
          if (!item) {
            return;
          }
          if (ordered && item.locale != locale) {
            return;
          }
          result +=
            '<li><a href="' +
            item.url +
            '">' +
            util.htmlEscape(item.title) +
            "</a>" +
            process_array(item, item.subpages || [], ordered, locale) +
            "</li>";
        });
        result += closeTag;
      }
      return result;
    }
  },
};
