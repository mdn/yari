/**
 * @prettier
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'lintHTML'.
const { lintHTML } = require("./utils");

const ERROR_TEST_CASES = [
  {
    title: "with an invalid HTML element",
    html: "<junk></junk>",
    error: "<junk> is not a valid element name",
  },
  {
    title: "with an HTML element missing its closing tag",
    html: "<div>closing tag has gone missing",
    error:
      "Missing close-tag, expected '</div>' but document ended before it was found.",
  },
  {
    title: "with an illegal value for a link attribute",
    html: '<a href="https://example.com" dir="xxx">an example</a>',
    error: 'Attribute "dir" has invalid value "xxx"',
  },
];

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("test lintHTML function", function () {
  for (const test of ERROR_TEST_CASES) {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it(test.title, function () {
      expect(lintHTML(test.html)).toContain(test.error);
    });
  }
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("with valid HTML input", function () {
    expect(lintHTML("<div>This is nice</div>")).toBeFalsy();
  });
});
