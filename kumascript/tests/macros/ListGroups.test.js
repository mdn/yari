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
              <svg class="icon icon-experimental" tabindex="0">
                <use xlink:href="/assets/badges.svg#icon-experimental"></use>
              </svg>
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
