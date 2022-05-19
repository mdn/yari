/**
 * Verify that all of the macros in ../macros/ compile without errors
 *
 * @prettier
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ejs'.
const ejs = require("ejs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Templates'... Remove this comment to see the full error message
const Templates = require("../src/templates.js");
const dirname = __dirname;

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("macros/ directory", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe("compile all macros", () => {
    const templates = new Templates(`${dirname}/../macros`);
    const templateMap = templates.getTemplateMap();
    const macroNames = Array.from(templateMap.keys());

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it.each(macroNames)("%s", (macro) => {
      const filename = templateMap.get(macro);
      const source = fs.readFileSync(filename, "utf-8");
      ejs.compile(source, { async: true });
    });
  });
});
