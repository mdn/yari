/**
 * Verify that all of the macros in ../macros/ compile without errors
 */
import fs from "fs";
import ejs from "ejs";
import Templates from "../src/templates";
const dirname = __dirname;

describe("macros/ directory", () => {
  describe("compile all macros", () => {
    const templates = new Templates(`${dirname}/../macros`);
    const templateMap = templates.getTemplateMap();
    const macroNames = Array.from(templateMap.keys());

    it.each(macroNames)("%s", (macro) => {
      const filename = templateMap.get(macro);
      const source = fs.readFileSync(filename, "utf-8");
      ejs.compile(source, { async: true });
    });
  });
});
