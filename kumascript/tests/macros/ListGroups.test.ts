import fs from "node:fs";

import { jest } from "@jest/globals";
import { JSDOM } from "jsdom";

import { beforeEachMacro, describeMacro, itMacro, lintHTML } from "./utils.js";

/**
 * Load all the fixtures.
 */

const groupDataFixturePath = new URL(
  "./fixtures/listgroups/groupdata.json",
  import.meta.url
);
const groupDataFixture = JSON.parse(
  fs.readFileSync(groupDataFixturePath, "utf-8")
);

/**
 * Used to mock wiki.getPage()
 */
const overviewPages = {
  "/en-US/docs/Web/API/An_overview_page_for_ATestInterface_API": {
    tags: ["foo", "bar"],
    status: [],
  },
  "/en-US/docs/Web/API/A2TestInterface_overview": {
    tags: ["experimental"],
    status: [],
  },
  "/en-US/docs/Web/API/An_overview_page_for_BTestInterface_API": {
    tags: [],
    status: [],
  },
};

/**
 * Used to test against the actual HTML we get back.
 */
const expectedHTML = `<div class="index">
    <H3>A</H3>
    <ul>
        <li>
            <a href='/en-US/docs/Web/API/A2TestInterface_overview'>A2TestInterface</a>
            <span class='indexListBadges'>
              <abbr class="icon icon-experimental" title="Experimental. Expect behavior to change in the future.">
                <span class="visually-hidden">Experimental</span>
              </abbr>
            </span>
        </li>
        <li>
            <a href='/en-US/docs/Web/API/An_overview_page_for_ATestInterface_API'>ATestInterface</a>
        </li>
    </ul>
    <H3>B</H3>
    <ul>
        <li>
            <a href='/en-US/docs/Web/API/An_overview_page_for_BTestInterface_API'>BTestInterface</a>
        </li>
    </ul>
</div>`;

/**
 * Compare an expected node with an actual node.
 *
 * The main wrinkle here is that expectedHTML is pretty printed, to make it easy
 * to read, so the textContent is not identical for some nodes.
 * So we only compare textContent for: 'A' nodes or 'SPAN' nodes whose
 * textContent is not just whitespace
 */
function compareNode(actual, expected) {
  expect(actual.nodeName).toEqual(expected.nodeName);
  expect(actual.getAttribute("href")).toEqual(expected.getAttribute("href"));
  expect(actual.classList.value).toEqual(expected.classList.value);
  if (
    actual.nodeName === "A" ||
    (actual.nodeName === "H3" && expected.textContent.trim())
  ) {
    expect(actual.textContent.trim()).toEqual(expected.textContent.trim());
  }
}

/**
 * This is the entry point for checking the result of a test.
 */
function checkResult(html) {
  expect(lintHTML(html)).toBeFalsy();
  const actualDOM = JSDOM.fragment(html);
  const actualNodes = actualDOM.querySelectorAll("*");
  const expectedDOM = JSDOM.fragment(expectedHTML);
  const expectedNodes = expectedDOM.querySelectorAll("*");
  expect(expectedNodes.length).toEqual(actualNodes.length);
  for (let i = 0; i < expectedNodes.length; i++) {
    compareNode(actualNodes[i], expectedNodes[i]);
  }
}

function testMacro() {
  itMacro("Test ListGroups macro", (macro) => {
    return macro.call().then((result) => {
      checkResult(result);
    });
  });
}

describeMacro("ListGroups", () => {
  beforeEachMacro((macro) => {
    macro.ctx.env.locale = "en-US";
    // Mock calls to wiki.page
    macro.ctx.wiki.getPage = jest.fn((name: string) => {
      return overviewPages[name];
    });
    // Mock calls to GroupData
    const originalgetJSONData = macro.ctx.web.getJSONData;
    macro.ctx.web.getJSONData = jest.fn((name) => {
      if (name === "GroupData") {
        return groupDataFixture;
      } else {
        return originalgetJSONData(name);
      }
    });
    // Mock calls to smartLink
    macro.ctx.web.smartLink = jest.fn((groupUrl, _, text) => {
      return `<a href='${groupUrl}'>${text}</a>`;
    });
  });

  testMacro();
});
