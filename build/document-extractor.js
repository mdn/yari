const cheerio = require("./monkeypatched-cheerio");
const { packageBCD } = require("./resolve-bcd");

/**
 * Given a cheerio doc, extract all the <h2> tags and make it a
 * structured thing.
 */
function extractTOC($) {
  const toc = [];
  // Use .each() instead of .map() so we can do filtering lazily
  // within each callback instead of having to .filter() first.
  $("h2").each((i, element) => {
    const $element = $(element);
    const text = $element.text();
    const id = $element.attr("id");
    if (text && id) {
      toc.push({ text, id });
    }
  });
  return toc;
}

/** Extract and mutate the $ if it as a "Quick_Links" section.
 * But only if it exists.
 *
 * If you had this:
 *
 *   const $ = cheerio.load(`
 *      <div id="Quick_Links">Stuff</div>
 *      <h2>Headline<h2>
 *      <p>Text</p>
 *    `)
 *   const sidebar = extractSidebar($);
 *   console.log(sidebar);
 *   // '<div id="Quick_Links">Stuff</div>'
 *   console.log($.html());
 *   // '<h2>Headline<h2>\n<p>Text</p>'
 *
 * ...give or take some whitespace.
 */
function extractSidebar($) {
  const search = $("#Quick_Links");
  if (!search.length) {
    return "";
  }
  const sidebarHtml = search.html();
  search.remove();
  return sidebarHtml;
}

function extractDocumentSections($) {
  const sections = [];
  let section = cheerio
    .load("<div></div>", {
      // decodeEntities: false
    })("div")
    .eq(0);

  const iterable = [...$("#_body")[0].childNodes];

  let c = 0;
  iterable.forEach((child) => {
    if (child.tagName === "h2") {
      if (c) {
        sections.push(...addSections(section.clone()));
        section.empty();
      }
      c = 0;
    }
    // We *could* wrap this in something like `if (child.tagName) {`
    // which would exclude any node that isn't a tag, such as comments.
    // That might make the DOM nodes more compact and memory efficient.
    c++;
    section.append(child);
  });
  if (c) {
    // last straggler
    sections.push(...addSections(section));
  }
  return sections;
}

/** Return an array of new sections to be added to the complete document.
 *
 * Generally, this function is called with a cheerio (`$`) section that
 * has HTML in it. The task is to structure that a little bit.
 * If the HTML inside the '$' is:
 *
 *   <h2 id="foo">Foo</h2>
 *   <p>Bla bla</p>
 *   <ul><li>One</li></ul>
 *
 * then, the expected output is to return:
 *
 *   [{
 *       type: "prose",
 *       id: "foo",
 *       title: "Foo"
 *       content: "<p>Bla bla<p>\n<ul><li>One</li></ul>"
 *   }]
 *
 * The reason it's always returning an array is because of special
 * sections. A special section is one where we try to transform it
 * first. For example BCD tables. If the input is this:
 *
 *   <h2 id="browser_compat">Browser Compat</h2>
 *   <div class="bc-data" id="bcd:foo.bar.thing">...</div>
 *
 * Then, extract the ID, get the structured data and eventually return this:
 *
 *   [{
 *     type: "browser_compatibility",
 *     value: {
 *        query: "foo.bar.thing",
 *        id: "browser_compat",
 *        title: "Browser Compat",
 *        data: {....}
 *   }]
 *
 * At the time of writing (Jan 2020), there is only one single special type of
 * section and that's BCD. The idea is we look for a bunch of special sections
 * and if all else fails, just leave it as HTML as is.
 */
function addSections($) {
  if ($.find("div.bc-data").length) {
    /** If there's exactly 1 BCD table the only section to add is something
     * like this:
     *    {
     *     "type": "browser_compatibility",
     *     "value": {
     *       "title": "Browser compatibility",
     *       "id": "browser_compatibility",
     *        "query": "html.elements.video",
     *        "data": {....}
     *    }
     *
     * Where the 'title' and 'id' values comes from the <h2> tag (if available).
     *
     * However, if there are **multiple BCD tables**, which is rare, the it
     * needs to return something like this:
     *
     *   [{
     *     "type": "prose",
     *     "value": {
     *       "id": "browser_compatibility",
     *       "title": "Browser compatibility"
     *       "content": "Possible stuff before the table"
     *    },
     *    {
     *     "type": "browser_compatibility",
     *     "value": {
     *        "query": "html.elements.video",
     *        "data": {....
     *    },
     *   {
     *     "type": "prose",
     *     "value": {
     *       "content": "Any other stuff before table maybe"
     *    },
     */
    if ($.find("div.bc-data").length > 1) {
      const subSections = [];
      let section = cheerio
        .load("<div></div>", {
          // decodeEntities: false
        })("div")
        .eq(0);

      // Loop over each and every "root element" in the node and keep piling
      // them up in a buffer, until you encounter a `div.bc-table` then
      // add that to the stack, clear and repeat.
      let iterable = [...$[0].childNodes];
      let c = 0;
      iterable.forEach((child) => {
        if (
          child.tagName === "div" &&
          child.attribs &&
          child.attribs.class &&
          /bc-data/.test(child.attribs.class)
        ) {
          if (c) {
            subSections.push(..._addSectionProse(section.clone()));
            section.empty();
            c = 0; // reset the counter
          }
          section.append(child);
          // XXX That `_addSingleSectionBCD(section.clone())` might return a
          // and empty array and that means it failed and we should
          // bail.
          subSections.push(..._addSingleSectionBCD(section.clone()));
          section.empty();
        } else {
          section.append(child);
          c++;
        }
      });
      if (c) {
        subSections.push(..._addSectionProse(section.clone()));
      }
      return subSections;
    } else {
      const bcdSections = _addSingleSectionBCD($);
      // If it comes back as an empty array, it means it couldn't be
      // turned into structured content. So don't bother.
      if (bcdSections.length) {
        return bcdSections;
      }
    }
  }

  // all else, leave as is
  return _addSectionProse($);
}

function _addSingleSectionBCD($) {
  let id = null;
  let title = null;

  const h2s = $.find("h2");
  if (h2s.length === 1) {
    id = h2s.attr("id");
    title = h2s.text();
  }

  const dataQuery = $.find("div.bc-data").attr("id");
  // Some old legacy documents haven't been re-rendered yet, since it
  // was added, so the `div.bc-data` tag doesn't have a `id="bcd:..."`
  // attribute. If that's the case, bail and fail back on a regular
  // prose section :(
  if (!dataQuery) {
    // I wish there was a good place to log this!
    return _addSectionProse($);
  }
  const query = dataQuery.replace(/^bcd:/, "");
  const { browsers, data } = packageBCD(query);
  if (data === undefined) {
    return [];
  }

  // First extract a map of all release data, keyed by (normalized) browser
  // name and the versions.
  // You'll have a map that looks like this:
  //
  //   'chrome_android': {
  //      '28': {
  //        release_data: '2012-06-01',
  //        release_notes: '...',
  //        ...
  //
  // The reason we extract this to a locally scoped map, is so we can
  // use it to augment the `__compat` blocks for the latest version
  // when (if known) it was added.
  const browserReleaseData = new Map();
  for (const [name, browser] of Object.entries(browsers)) {
    const releaseData = new Map();
    for (const [version, data] of Object.entries(browser.releases || [])) {
      if (data) {
        releaseData.set(version, data);
      }
    }
    browserReleaseData.set(name, releaseData);
  }

  // We never need this data, after the release info has been extracted
  // for each 'version_added'.
  Object.values(browsers).forEach((browser) => {
    // Remove because it's added weight which we don't need in the
    // state data sent to the client eventually.
    delete browser.releases;
  });

  for (const [key, compat] of Object.entries(data)) {
    let block;
    if (key === "__compat") {
      block = compat;
    } else if (compat.__compat) {
      block = compat.__compat;
    }
    if (block) {
      for (const [browser, info] of Object.entries(block.support)) {
        const added = info.version_added;
        if (browserReleaseData.has(browser)) {
          if (browserReleaseData.get(browser).has(added)) {
            info.release_date = browserReleaseData
              .get(browser)
              .get(added).release_date;
          }
        }
      }
    }
  }

  return [
    {
      type: "browser_compatibility",
      value: {
        title,
        id,
        data,
        query,
        browsers,
      },
    },
  ];
}

function _addSectionProse($) {
  let id = null;
  let title = null;
  // Maybe this should check that the h2 is first??
  const h2s = $.find("h2");
  if (h2s.length === 1) {
    id = h2s.attr("id");
    title = h2s.text();
    // XXX Maybe this is a bad idea.
    // See https://wiki.developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Page_types/API_reference_page_template
    // where the <h2> needs to be INSIDE the `<div class="note">`.
    h2s.remove();
    // } else if (h2s.length > 1) {
    //     throw new Error("Too many H2 tags");
  }

  return [
    {
      type: "prose",
      value: {
        id,
        title,
        content: $.html().trim(),
      },
    },
  ];
}

module.exports = {
  extractSidebar,
  extractDocumentSections,
  extractTOC,
};
