const cheerio = require("cheerio");
const { packageBCD } = require("./resolve-bcd");
const specs = require("browser-specs");
const web = require("../kumascript/src/api/web.js");

/** Extract and mutate the $ if it as a "Quick_links" section.
 * But only if it exists.
 *
 * If you had this:
 *
 *   const $ = cheerio.load(`
 *      <div id="Quick_links">Stuff</div>
 *      <h2>Headline<h2>
 *      <p>Text</p>
 *    `)
 *   const sidebar = extractSidebar($);
 *   console.log(sidebar);
 *   // '<div id="Quick_links">Stuff</div>'
 *   console.log($.html());
 *   // '<h2>Headline<h2>\n<p>Text</p>'
 *
 * ...give or take some whitespace.
 */
function extractSidebar($) {
  const search = $("#Quick_links");
  if (!search.length) {
    return "";
  }
  const sidebarHtml = search.html();
  search.remove();
  return sidebarHtml;
}

function extractSections($) {
  const flaws = [];
  const sections = [];
  const section = cheerio
    .load("<div></div>", {
      // decodeEntities: false
    })("div")
    .eq(0);

  const iterable = [...$("#_body")[0].childNodes];

  let c = 0;
  iterable.forEach((child) => {
    if (child.tagName === "h2" || child.tagName === "h3") {
      if (c) {
        const [subSections, subFlaws] = addSections(section.clone());
        sections.push(...subSections);
        flaws.push(...subFlaws);
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
    const [subSections, subFlaws] = addSections(section);
    sections.push(...subSections);
    flaws.push(...subFlaws);
  }

  // Check for and mutate possible duplicated IDs.
  // If a HTML document has...:
  //
  //   <h2 id="Examples">Check these examples</h2>
  //   ...
  //   <h2 id="examples">Examples</h2>
  //
  // then this can cause various problems. For example, the anchor links
  // won't work. The Table of Contents won't be able to do a loop with unique
  // `key={section.id}` values.
  // The reason we need to loop through to get a list of all existing IDs
  // first is because we might have this:
  //
  //  <h2 id="foo">Foo X</h2>
  //  <h2 id="foo">Foo Y</h2>
  //  <h2 id="foo_2">Foo Z</h2>
  //
  // So when you encounter `<h2 id="foo">Foo Y</h2>` you'll know that you
  // can't suggest it to be `<h2 id="foo_2">Foo Y</h2>` because that ID
  // is taken by another one, later.
  const allIDs = new Set(
    sections
      .map((section) => section.value.id)
      .filter(Boolean)
      .map((id) => id.toLowerCase())
  );

  const seenIDs = new Set();
  for (const section of sections) {
    const originalID = section.value.id;
    if (!originalID) {
      // Not all sections have an ID. For example, prose sections that don't
      // start with a <h2>.
      // Since we're primarily concerned about *uniqueness* here, let's just
      // skip worrying about these.
      continue;
    }
    // We normalize all IDs to lowercase so that `id="Foo"` === `id="foo"`.
    const id = originalID.toLowerCase();
    if (seenIDs.has(id)) {
      // That's bad! We have to come up with a new ID but it can't be one
      // that's used by another other section.
      let increment = 2;
      let newID = `${originalID}_${increment}`;
      while (
        seenIDs.has(newID.toLowerCase()) ||
        allIDs.has(newID.toLowerCase())
      ) {
        increment++;
        newID = `${originalID}_${increment}`;
      }
      section.value.id = newID;
      seenIDs.add(newID.toLowerCase());
      flaws.push(
        `'${originalID}' is not a unique ID in this HTML (temporarily changed to ${section.value.id})`
      );
    } else {
      seenIDs.add(id);
    }
  }

  return [sections, flaws];
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
 *   <div class="bc-data" data-query="foo.bar.thing">...</div>
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
 * Another example is for the specification section. If the input is this:
 *
 *   <h2 id="Specifications">Specifications</h2>
 *   <div class="bc-specs" data-bcd-query="foo.bar.thing">...</div>
 *
 * Then, extract the data-bcd-query and return this:
 *
 *   [{
 *     type: "specifications",
 *     value: {
 *        query: "foo.bar.thing",
 *        id: "specifications",
 *        title: "Specifications",
 *        specifications: {....}
 *   }]
 */
function addSections($) {
  const flaws = [];

  const countPotentialSpecialDivs = $.find("div.bc-data, div.bc-specs").length;
  if (countPotentialSpecialDivs) {
    /** If there's exactly 1 special table the only section to add is something
     * like this:
     *    {
     *     "type": "browser_compatibility",
     *     "value": {
     *       "title": "Browser compatibility",
     *       "id": "browser_compatibility",
     *       "query": "html.elements.video",
     *       "data": {....}
     *    }
     *
     * Where the 'title' and 'id' values comes from the <h2> tag (if available).
     *
     * However, if there are **multiple special tables**,
     * it needs to return something like this:
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
    if (countPotentialSpecialDivs > 1) {
      const subSections = [];
      const section = cheerio
        .load("<div></div>", {
          // decodeEntities: false
        })("div")
        .eq(0);

      // Loop over each and every "root element" in the node and keep piling
      // them up in a buffer, until you encounter a `div.bc-data` or `div.bc-specs` then
      // add that to the stack, clear and repeat.
      const iterable = [...$[0].childNodes];
      let c = 0;
      let countSpecialDivsFound = 0;
      iterable.forEach((child) => {
        if (
          child.tagName === "div" &&
          child.attribs &&
          child.attribs.class &&
          (child.attribs.class.includes("bc-data") ||
            child.attribs.class.includes("bc-specs"))
        ) {
          countSpecialDivsFound++;
          if (c) {
            const [proseSections, proseFlaws] = _addSectionProse(
              section.clone()
            );
            subSections.push(...proseSections);
            flaws.push(...proseFlaws);
            section.empty();
            c = 0; // reset the counter
          }
          section.append(child);
          // XXX That `_addSingleSpecialSection(section.clone())` might return a
          // and empty array and that means it failed and we should
          // bail.
          subSections.push(..._addSingleSpecialSection(section.clone()));
          section.empty();
        } else {
          section.append(child);
          c++;
        }
      });
      if (c) {
        const [proseSections, proseFlaws] = _addSectionProse(section.clone());
        subSections.push(...proseSections);
        flaws.push(...proseFlaws);
      }
      if (countSpecialDivsFound !== countPotentialSpecialDivs) {
        const leftoverCount = countPotentialSpecialDivs - countSpecialDivsFound;
        const explanation = `${leftoverCount} 'div.bc-data' or 'div.bc-specs' element${
          leftoverCount > 1 ? "s" : ""
        } found but deeply nested.`;
        flaws.push(explanation);
      }
      return [subSections, flaws];
    }
    const specialSections = _addSingleSpecialSection($);

    // The _addSingleSpecialSection() function will have sucked up the <h2> or <h3>
    // and the `div.bc-data` or `div.bc-specs` to turn it into a special section.
    // First remove that, then put whatever HTML is left as a prose
    // section underneath.
    $.find("div.bc-data, h2, h3").remove();
    $.find("div.bc-specs, h2, h3").remove();
    const [proseSections, proseFlaws] = _addSectionProse($);
    specialSections.push(...proseSections);
    flaws.push(...proseFlaws);

    if (specialSections.length) {
      return [specialSections, flaws];
    }
  }

  // all else, leave as is
  const [proseSections, proseFlaws] = _addSectionProse($);
  flaws.push(...proseFlaws);

  return [proseSections, flaws];
}

function _addSingleSpecialSection($) {
  let id = null;
  let title = null;
  let isH3 = false;

  const h2s = $.find("h2");
  if (h2s.length === 1) {
    id = h2s.attr("id");
    title = h2s.text();
  } else {
    const h3s = $.find("h3");
    if (h3s.length === 1) {
      id = h3s.attr("id");
      title = h3s.text();
      isH3 = true;
    }
  }

  let dataQuery = null;
  let specURLsString = "";
  let specialSectionType = null;
  if ($.find("div.bc-data").length) {
    specialSectionType = "browser_compatibility";
    const elem = $.find("div.bc-data");
    // Macro adds "data-query", but some translated-content still uses "id".
    dataQuery = elem.attr("data-query") || elem.attr("id");
  } else if ($.find("div.bc-specs").length) {
    specialSectionType = "specifications";
    dataQuery = $.find("div.bc-specs").attr("data-bcd-query");
    specURLsString = $.find("div.bc-specs").attr("data-spec-urls");
  }

  // Some old legacy documents haven't been re-rendered yet, since it
  // was added, so the `div.bc-data` tag doesn't have a a `id="bcd:..."`
  // or `data-bcd="..."` attribute. If that's the case, bail and fall
  // back on a regular prose section :(
  if (!dataQuery && specURLsString === "") {
    // I wish there was a good place to log this!
    const [proseSections] = _addSectionProse($);
    return proseSections;
  }
  const query = dataQuery.replace(/^bcd:/, "");
  const { browsers, data } = packageBCD(query);

  if (specialSectionType === "browser_compatibility") {
    if (data === undefined) {
      return [
        {
          type: specialSectionType,
          value: {
            title,
            id,
            isH3,
            data: null,
            query,
            browsers: null,
          },
        },
      ];
    }
    return _buildSpecialBCDSection();
  } else if (specialSectionType === "specifications") {
    if (data === undefined && specURLsString === "") {
      return [
        {
          type: specialSectionType,
          value: {
            title,
            id,
            isH3,
            query,
            specifications: [],
          },
        },
      ];
    }
    return _buildSpecialSpecSection();
  }

  throw new Error(`Unrecognized special section type '${specialSectionType}'`);

  function _buildSpecialBCDSection() {
    // First extract a map of all release data, keyed by (normalized) browser
    // name and the versions.
    // You'll have a map that looks like this:
    //
    //   'chrome_android': {
    //      '28': {
    //        release_date: '2012-06-01',
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

    for (const block of _extractCompatBlocks(data)) {
      for (let [browser, info] of Object.entries(block.support)) {
        // `info` here will be one of the following:
        //  - a single simple_support_statement:
        //    { version_added: 42 }
        //  - an array of simple_support_statements:
        //    [ { version_added: 42 }, { prefix: '-moz', version_added: 35 } ]
        //
        // Standardize the first version to an array of one, so we don't have
        // to deal with two different forms below
        if (!Array.isArray(info)) {
          info = [info];
        }
        for (const infoEntry of info) {
          const added =
            typeof infoEntry.version_added === "string" &&
            infoEntry.version_added.startsWith("≤")
              ? infoEntry.version_added.slice(1)
              : infoEntry.version_added;
          if (browserReleaseData.has(browser)) {
            if (browserReleaseData.get(browser).has(added)) {
              infoEntry.release_date = browserReleaseData
                .get(browser)
                .get(added).release_date;
            }
          }
        }
        info.sort((a, b) =>
          _compareVersions(_getFirstVersion(b), _getFirstVersion(a))
        );
      }
    }

    return [
      {
        type: "browser_compatibility",
        value: {
          title,
          id,
          isH3,
          data,
          query,
          browsers,
        },
      },
    ];
  }

  /**
   * @param {object} support - {bcd.SimpleSupportStatement}
   * @returns {string}
   */
  function _getFirstVersion(support) {
    if (typeof support.version_added === "string") {
      return support.version_added;
    } else if (typeof support.version_removed === "string") {
      return support.version_removed;
    } else {
      return "0";
    }
  }

  /**
   * @param {string} a
   * @param {string} b
   */
  function _compareVersions(a, b) {
    const x = _splitVersion(a);
    const y = _splitVersion(b);

    return _compareNumberArray(x, y);
  }

  /**
   * @param {number[]} a
   * @param {number[]} b
   * @return {number}
   */
  function _compareNumberArray(a, b) {
    while (a.length || b.length) {
      const x = a.shift() || 0;
      const y = b.shift() || 0;
      if (x !== y) {
        return x - y;
      }
    }

    return 0;
  }

  /**
   * @param {string} version
   * @return {number[]}
   */
  function _splitVersion(version) {
    if (version.startsWith("≤")) {
      version = version.slice(1);
    }

    return version.split(".").map(Number);
  }

  /**
   * Recursively extracts `__compat` objects from the `feature` and from all
   * nested features at any depth.
   *
   * @param {Object} feature The feature.
   * @returns {Object[]} The array of `__compat` objects.
   */
  function _extractCompatBlocks(feature) {
    const blocks = [];
    for (const [key, value] of Object.entries(feature)) {
      if (key === "__compat") {
        blocks.push(value);
      } else if (typeof value === "object") {
        blocks.push(..._extractCompatBlocks(value));
      }
    }
    return blocks;
  }

  function _buildSpecialSpecSection() {
    // Collect spec URLs from a BCD feature, a 'spec-urls' value, or both;
    // For a BCD feature, it can either be a string or an array of strings.
    let specURLs = [];

    if (data) {
      // If 'data' is non-null, that means we have data for a BCD feature
      // that we can extract spec URLs from.
      for (const [key, compat] of Object.entries(data)) {
        if (key === "__compat" && compat.spec_url) {
          if (Array.isArray(compat.spec_url)) {
            specURLs = compat.spec_url;
          } else {
            specURLs.push(compat.spec_url);
          }
        }
      }
    }

    if (specURLsString !== "") {
      // If specURLsString is non-empty, then it has the string contents of
      // the document’s 'spec-urls' frontmatter key: one or more URLs.
      specURLs.push(...specURLsString.split(",").map((url) => url.trim()));
    }

    // Use BCD specURLs to look up more specification data
    // from the browser-specs package
    const specifications = specURLs
      .map((specURL) => {
        const spec = specs.find(
          (spec) =>
            specURL.startsWith(spec.url) ||
            specURL.startsWith(spec.nightly.url) ||
            specURL.startsWith(spec.series.nightlyUrl)
        );
        const specificationsData = {
          bcdSpecificationURL: specURL,
          title: "Unknown specification",
        };
        if (spec) {
          specificationsData.title = spec.title;
        } else {
          const specList = web.getJSONData("SpecData");
          const titleFromSpecData = Object.keys(specList).find(
            (key) => specList[key]["url"] === specURL.split("#")[0]
          );
          if (titleFromSpecData) {
            specificationsData.title = titleFromSpecData;
          }
        }

        return specificationsData;
      })
      .filter(Boolean);

    return [
      {
        type: "specifications",
        value: {
          title,
          id,
          isH3,
          specifications,
          query,
        },
      },
    ];
  }
}

function _addSectionProse($) {
  let id = null;
  let title = null;
  let titleAsText = null;
  let isH3 = false;

  const flaws = [];

  // The way this works...
  // Given a section of HTML, try to extract a id, title,

  let h2found = false;
  const h2s = $.find("h2");
  for (const i of [...Array(h2s.length).keys()]) {
    if (i) {
      // Excess!
      flaws.push(
        `Excess <h2> tag that is NOT at root-level (id='${h2s
          .eq(i)
          .attr("id")}', text='${h2s.eq(i).text()}')`
      );
    } else {
      // First element
      id = h2s.eq(i).attr("id");
      title = h2s.eq(i).html();
      titleAsText = h2s.eq(i).text();
      h2s.eq(i).remove();
    }
    h2found = true;
  }

  // If there was no <h2>, look through all the <h3>s.
  if (!h2found) {
    const h3s = $.find("h3");
    for (const i of [...Array(h3s.length).keys()]) {
      if (i) {
        // Excess!
        flaws.push(
          `Excess <h3> tag that is NOT at root-level (id='${h3s
            .eq(i)
            .attr("id")}', text='${h3s.eq(i).text()}')`
        );
      } else {
        id = h3s.eq(i).attr("id");
        title = h3s.eq(i).html();
        titleAsText = h3s.eq(i).text();
        if (id && title) {
          isH3 = true;
          h3s.eq(i).remove();
        }
      }
    }
  }

  if (id) {
    // Remove trailing underscores (https://github.com/mdn/yari/issues/5492).
    id = id.replace(/_+$/g, "");
  }

  const value = {
    id,
    title,
    isH3,
    content: $.html().trim(),
  };

  // Only include it if it's useful. It's an optional property and it's
  // potentially a waste of space to include it if it's not different.
  if (titleAsText && titleAsText !== title) {
    value.titleAsText = titleAsText;
  }

  const sections = [];
  if (value.content || value.title) {
    sections.push({
      type: "prose",
      value,
    });
  }

  return [sections, flaws];
}

/**
 * Given an array of sections, return a plain text
 * string of a summary. No HTML or Kumascript allowed.
 */
function extractSummary(sections) {
  let summary = ""; // default and fallback is an empty string.

  function extractFirstGoodParagraph($) {
    const seoSummary = $("span.seoSummary, .summary");
    if (seoSummary.length && seoSummary.text()) {
      return seoSummary.text();
    }
    let summary = "";
    $("p").each((i, p) => {
      // The `.each()` can only take a callback, so we need a solution
      // to exit early once we've found the first working summary.
      if (summary) return; // it already been found!
      const text = $(p).text().trim();
      // Avoid those whose paragraph is just a failing KS macro
      if (text && !text.includes("Redirect") && !text.startsWith("{{")) {
        summary = text;
      }
    });
    return summary;
  }
  // If the sections contains a "Summary" one, use that, otherwise
  // use the first prose one.
  const summarySections = sections.filter(
    (section) => section.type === "prose" && section.value.title === "Summary"
  );
  if (summarySections.length) {
    const $ = cheerio.load(summarySections[0].value.content);
    summary = extractFirstGoodParagraph($);
  } else {
    for (const section of sections) {
      if (
        section.type !== "prose" ||
        !section.value ||
        !section.value.content
      ) {
        continue;
      }
      const $ = cheerio.load(section.value.content);
      // Remove non-p tags that we should not be looking inside.
      $("div.notecard, div.note, div.blockIndicator").remove();
      summary = extractFirstGoodParagraph($);
      if (summary) {
        break;
      }
    }
  }
  return summary;
}

module.exports = {
  extractSidebar,
  extractSections,
  extractSummary,
};
