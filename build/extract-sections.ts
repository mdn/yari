import * as cheerio from "cheerio";
import { Element, ParentNode } from "domhandler";
import { ProseSection, Section } from "../libs/types/document.js";
import { extractSpecifications } from "./extract-specifications.js";

type SectionsAndFlaws = [Section[], string[]];

export async function extractSections(
  $: cheerio.CheerioAPI
): Promise<[Section[], string[]]> {
  const flaws: string[] = [];
  const sections: Section[] = [];
  const section = cheerio.load("<div></div>")("div").eq(0);

  const bodies = $("body");
  const body = bodies[0] as ParentNode;
  const iterable = [...(body.childNodes as Element[])];

  let c = 0;
  for (const child of iterable) {
    if (
      (child as Element).tagName === "h2" ||
      (child as Element).tagName === "h3"
    ) {
      if (c) {
        const [subSections, subFlaws] = await addSections(section.clone());
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
  }

  if (c) {
    // last straggler
    const [subSections, subFlaws] = await addSections(section);
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
async function addSections(
  $: cheerio.Cheerio<Element>
): Promise<SectionsAndFlaws> {
  const flaws: string[] = [];

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
      const subSections: Section[] = [];
      const section = cheerio.load("<div></div>")("div").eq(0);

      // Loop over each and every "root element" in the node and keep piling
      // them up in a buffer, until you encounter a `div.bc-data` or `div.bc-specs` then
      // add that to the stack, clear and repeat.
      const div = $[0] as ParentNode;
      console.log({ div });
      const iterable = [...(div.childNodes as Element[])];
      let c = 0;
      let countSpecialDivsFound = 0;
      for (const child of iterable) {
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
          subSections.push(
            ...(await _addSingleSpecialSection(section.clone()))
          );
          section.empty();
        } else {
          section.append(child);
          c++;
        }
      }
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
    const specialSections = await _addSingleSpecialSection($);

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

async function _addSingleSpecialSection(
  $: cheerio.Cheerio<Element>
): Promise<Section[]> {
  let id: string | null = null;
  let title: string | null = null;
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

  let dataQuery = "";
  let hasMultipleQueries = false;
  let specURLsString = "";
  let specialSectionType: string | null = null;
  if ($.find("div.bc-data").length) {
    specialSectionType = "browser_compatibility";
    const elem = $.find("div.bc-data");
    // Macro adds "data-query", but some translated-content still uses "id".
    dataQuery = (elem.attr("data-query") || elem.attr("id")) ?? "";
    hasMultipleQueries = elem.attr("data-multiple") === "true";
  } else if ($.find("div.bc-specs").length) {
    specialSectionType = "specifications";
    dataQuery = $.find("div.bc-specs").attr("data-bcd-query") ?? "";
    specURLsString = $.find("div.bc-specs").attr("data-spec-urls") ?? "";
  }

  // Some old legacy documents haven't been re-rendered yet, since it
  // was added, so the `div.bc-data` tag doesn't have a `id="bcd:..."`
  // or `data-bcd="..."` attribute. If that's the case, bail and fall
  // back on a regular prose section :(
  if (!dataQuery && specURLsString === "") {
    // I wish there was a good place to log this!
    return _addSectionProse($)[0];
  }
  const query = dataQuery.replace(/^bcd:/, "");

  if (specialSectionType === "browser_compatibility") {
    if (hasMultipleQueries) {
      title = query;
      id = query;
      isH3 = true;
    }

    return [
      {
        type: specialSectionType,
        value: {
          title,
          id,
          isH3,
          query,
        },
      },
    ];
  } else if (specialSectionType === "specifications") {
    const specifications = await extractSpecifications(query, specURLsString);

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

  throw new Error(`Unrecognized special section type '${specialSectionType}'`);
}

function _addSectionProse($: cheerio.Cheerio<Element>): SectionsAndFlaws {
  let id: string | null = null;
  let title: string | null = null;
  let isH3 = false;

  const flaws: string[] = [];

  // The way this works...
  // Given a section of HTML, try to extract a id, title,

  let h2found = false;
  const h2s = $.find("h2");
  h2s.each((i) => {
    const h2 = h2s.eq(i);

    if (i) {
      // Excess!
      flaws.push(
        `Excess <h2> tag that is NOT at root-level (id='${h2.attr(
          "id"
        )}', text='${h2.text()}')`
      );
    } else {
      // First element
      id = h2.attr("id") ?? "";
      title = h2.html() ?? "";
      h2.remove();
    }
    h2found = true;
  });

  // If there was no <h2>, look through all the <h3>s.
  if (!h2found) {
    const h3s = $.find("h3");
    h3s.each((i) => {
      const h3 = h3s.eq(i);
      if (i) {
        // Excess!
        flaws.push(
          `Excess <h3> tag that is NOT at root-level (id='${h3.attr(
            "id"
          )}', text='${h3.text()}')`
        );
      } else {
        id = h3.attr("id") ?? "";
        title = h3.html() ?? "";
        if (id && title) {
          isH3 = true;
          h3.remove();
        }
      }
    });
  }

  if (id) {
    // Remove trailing underscores (https://github.com/mdn/yari/issues/5492).
    id = id.replace(/_+$/g, "");
  }

  const value: ProseSection["value"] = {
    id,
    title,
    isH3,
    content: $.html()?.trim(),
  };

  const sections: ProseSection[] = [];
  if (value.content || value.title) {
    sections.push({
      type: "prose",
      value,
    });
  }

  return [sections, flaws];
}
