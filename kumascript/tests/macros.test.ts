/**
 * Verify that all of the macros in ../macros/ compile without errors
 */
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import ejs from "ejs";
import Templates from "../src/templates.js";

describe("macros/ directory", () => {
  describe("compile all macros", () => {
    const templates = new Templates(
      fileURLToPath(new URL("../macros", import.meta.url))
    );
    const templateMap = templates.getTemplateMap();
    const macroNames = Array.from(templateMap.keys());

    it.each(macroNames)("%s", async (macro) => {
      const filename = templateMap.get(macro);
      const source = await fs.readFile(filename, "utf-8");
      ejs.compile(source, { async: true });
    });
  });
});
