/**
 * @prettier
 */
const { JSDOM } = require("jsdom");

const {
  beforeEachMacro,
  describeMacro,
  itMacro,
  lintHTML,
} = require("./utils");

/**
 * Load all the fixtures.
 */
const fs = require("fs");
const path = require("path");
const groupDataFixturePath = path.resolve(
  __dirname,
  "fixtures/listgroups/groupdata.json"
);
const groupDataFixture = fs.readFileSync(groupDataFixturePath, "utf8");

/**
 * Used to mock wiki.getPage()
 */
const overviewPages = {
  "/en-US/docs/Web/API/An_overview_page_for_ATestInterface_API": {
    tags: ["foo", "bar"],
  },
  "/en-US/docs/Web/API/A2TestInterface_overview": { tags: ["experimental"] },
  "/en-US/docs/Web/API/An_overview_page_for_BTestInterface_API": { tags: [] },
};

/**
 * Used to test against the actual HTML we get back.
 */
const expectedHTML = `<div class="index">
    <span>A</span>
    <ul>
        <li>
            <a href='/en-US/docs/Web/API/A2TestInterface_overview'>A2TestInterface</a>
            <span class='indexListBadges'>
              <svg class="icon experimental" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img">
                <title>This is an experimental API that should not be used in production code.</title>
                <path d="M90.72 82.34c4.4 7 1.29 12.66-7 12.66H16.25C8 95 4.88 89.31 9.28 82.34l29.47-46.46V12.5H35A3.75 3.75 0 0135 5h30a3.75 3.75 0 010 7.5h-3.75v23.38zM45.08 39.86L29.14 65h41.72L54.92 39.86l-1.17-1.81V12.5h-7.5v25.55z" />
              </svg
            </span>
        </li>
        <li>
            <a href='/en-US/docs/Web/API/An_overview_page_for_ATestInterface_API'>ATestInterface</a>
        </li>
    </ul>
    <span>B</span>
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
    (actual.nodeName === "SPAN" && expected.textContent.trim())
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
    macro.ctx.wiki.getPage = jest.fn((name) => {
      return overviewPages[name];
    });
    // Mock calls to GroupData
    const originalTemplate = macro.ctx.template;
    macro.ctx.template = jest.fn(async (name, ...args) => {
      if (name === "GroupData") {
        return groupDataFixture;
      }
      return await originalTemplate(name, ...args);
    });
  });

  testMacro();
});
