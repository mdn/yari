import { DEFAULT_LOCALE } from "../../../libs/constants/index.js";
import { KumaThis } from "../environment.js";
import * as util from "./util.js";

const wiki = {
  //
  // Given a string, escape any quotes within it so it can be
  // passed to other functions.
  //
  escapeQuotes: util.escapeQuotes,

  // Retrieve the content of a document for inclusion,
  // optionally filtering for a single section.
  //
  // Doesn't support the revision parameter offered by DekiScript
  //
  async page(this: KumaThis, path, section, revision, show, heading) {
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
            re = new RegExp(`(</?h)${i}([^>]*>)`, "gi");
            html = html.replace(re, `$1${i + offset}$2`);
          }
        } else if (offset < 0) {
          for (let i = level; i <= 6; i++) {
            re = new RegExp(`(</?h)${i}([^>]*>)`, "gi");
            html = html.replace(re, `$1${i + offset}$2`);
          }
        }
      }
      if (show) {
        return html;
      }
      // Rip out the section header
      if (html) {
        html = `${html.replace(/^<h\d[^>]*>[^<]*<\/h\d>/gi, "")}`;
      }
      return html;
    }

    let result = await this.renderPrerequisiteFromURL(
      (this.wiki as any).ensureExistence(path)
    );
    const pathDescription = this.info.getDescription(path);

    const tool = new util.HTMLTool(result, pathDescription);

    // First, we need to inject section ID's since the section
    // extraction often depends on them.
    tool.injectSectionIDs();
    tool.removeNoIncludes();

    if (section) {
      result = tool.extractSection(section);
    } else {
      result = tool.html();
    }

    return adjustHeadings(result, section, show || 0, heading);
  },

  // Returns all page objects for the specified page paths.
  async getPages(this: KumaThis, ...paths: string[]) {
    const pages = await Promise.all(
      paths.map((path) => (this.wiki as any).getPage(path))
    );

    return pages.filter((page) => page && page.url);
  },

  // Returns the page object for the specified page path.
  getPage(this: KumaThis, path) {
    return this.info.getPageByURL(path || this.env.url);
  },

  hasPage(this: KumaThis, path) {
    const page = this.info.getPageByURL(path || this.env.url);

    return Boolean(page.slug);
  },

  ensureExistence(this: KumaThis, path) {
    if (!this.info.hasPage(path)) {
      throw new Error(
        `${this.env.url.toLowerCase()} references ${this.info.getDescription(
          path
        )}, which does not exist`
      );
    }
    return path;
  },

  // Inserts a pages sub tree
  // if reverse is non-zero, the sort is backward
  // if ordered is true, the output is an <ol> instead of <ul>
  //
  // Special note: If ordered is true, pages whose locale differ from
  // the current page's locale are omitted, to work around misplaced
  // localizations showing up in navigation.
  tree(
    this: KumaThis,
    path: string,
    depth: number,
    self: boolean,
    reverse: boolean,
    ordered: boolean
  ) {
    // If the path ends with a slash, remove it.
    if (path.slice(-1) === "/") {
      path = path.slice(0, -1);
    }

    const locale = this.env.locale;
    // replace the locale if it's not the default locale
    const defaultPath = path.replace(
      new RegExp(`^/${locale}/`),
      `/${DEFAULT_LOCALE}/`
    );

    // get the return type of subpagesExpand
    type PageInfoArray = ReturnType<KumaThis["page"]["subpagesExpand"]>;
    type PageInfo = PageInfoArray[number];

    const pages = (this.page as any).subpagesExpand(
      defaultPath,
      depth,
      self
    ) as PageInfoArray;

    // Sort the pages by title with numeric option
    const collator = new Intl.Collator(undefined, {
      numeric: true,
    });
    function sortPages(pages: PageInfoArray) {
      if (reverse) {
        return pages.sort((a, b) => collator.compare(b.title, a.title));
      }
      return pages.sort((a, b) => collator.compare(a.title, b.title));
    }

    const process_array = (
      folderItem: PageInfo | null,
      arr: PageInfoArray,
      depth: number
    ) => {
      let result = "";
      const [openTag, closeTag] = ordered
        ? ["<ol>", "</ol>"]
        : ["<ul>", "</ul>"];

      // Sort the pages
      arr = sortPages(arr);

      if (arr.length) {
        result += openTag;

        // First add an extra item for linking to the folder's page
        // (only for ordered lists)
        if (folderItem && ordered) {
          result += `<li><a href="${folderItem.url}">${util.htmlEscape(
            folderItem.title
          )}</a></li>`;
        }

        // Now dive into the child items
        for (const item of arr) {
          if (!item) {
            return;
          }
          let subList = "";
          if (depth > 1) {
            subList = process_array(item, item.subpages || [], depth - 1);
          }
          const url = item.url.replace(DEFAULT_LOCALE, locale);
          let title = item.title;
          if (locale !== DEFAULT_LOCALE) {
            for (const translation of item.translations()) {
              if (translation.locale === locale) {
                title = translation.title;
                break;
              }
            }
          }
          result += `<li>${(this.web as any).smartLink(url, null, title)}${subList}</li>`;
        }
        result += closeTag;
      }
      return result;
    };

    return process_array(null, pages, depth);
  },
};

export default wiki;
