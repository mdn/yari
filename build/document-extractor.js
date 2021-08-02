const cheerio = require("cheerio");
const { packageBCD } = require("./resolve-bcd");
const specs = require("browser-specs");

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
  // Have to use both spellings because unfortunately, some sidebars don't come
  // from macros but have it hardcoded into the content. Perhaps it was the
  // result of someone once rendering out some sidebar macros.
  // We could consolidate it to just exactly one spelling (`quick_links`) but
  // that would require having to fix 29 macros and hundreds of translated content.
  // By selecting for either spelling we're being defensive and safe.
  const search = $("#Quick_Links, #Quick_links");
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
  let specialSectionType = null;
  if ($.find("div.bc-data").length) {
    specialSectionType = "browser_compatibility";
    dataQuery = $.find("div.bc-data").attr("id");
  } else if ($.find("div.bc-specs").length) {
    specialSectionType = "specifications";
    dataQuery = $.find("div.bc-specs").attr("data-bcd-query");
  }

  // Some old legacy documents haven't been re-rendered yet, since it
  // was added, so the `div.bc-data` tag doesn't have a `id="bcd:..."`
  // attribute. If that's the case, bail and fail back on a regular
  // prose section :(
  if (!dataQuery) {
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
    if (data === undefined) {
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

    for (const [key, compat] of Object.entries(data)) {
      let block;
      if (key === "__compat") {
        block = compat;
      } else if (compat.__compat) {
        block = compat.__compat;
      }
      if (block) {
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
            const added = infoEntry.version_added;
            if (browserReleaseData.has(browser)) {
              if (browserReleaseData.get(browser).has(added)) {
                infoEntry.release_date = browserReleaseData
                  .get(browser)
                  .get(added).release_date;
              }
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
          isH3,
          data,
          query,
          browsers,
        },
      },
    ];
  }

  function _buildSpecialSpecSection() {
    // Collect spec_urls from a BCD feature.
    // Can either be a string or an array of strings.
    let specURLs = [];

    for (const [key, compat] of Object.entries(data)) {
      if (key === "__compat" && compat.spec_url) {
        if (Array.isArray(compat.spec_url)) {
          specURLs = compat.spec_url;
        } else {
          specURLs.push(compat.spec_url);
        }
      }
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
          shortTitle: "Unknown specification",
        };
        if (spec) {
          specificationsData.title = spec.title;
          specificationsData.shortTitle = spec.shortTitle;
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

  const sections = [
    {
      type: "prose",
      value,
    },
  ];
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
