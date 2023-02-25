import fs from "node:fs/promises";
import fse from "fs-extra";
import { JSDOM } from "jsdom";
import extend from "extend";

import { assert, itMacro, describeMacro, lintHTML } from "./utils.js";

const fixture_dir = new URL("./fixtures/compat/", import.meta.url);

let fixtureCompatData = {};
for (const fn of await fs.readdir(fixture_dir)) {
  fixtureCompatData = extend(
    true,
    fixtureCompatData,
    await fse.readJson(new URL(fn, fixture_dir))
  );
}

describeMacro("Compat", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    macro.ctx.env["browser-compat"] = "api.feature";
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    const div = dom.querySelector<HTMLDivElement>("div.bc-data");
    assert.equal(div.id, "");
    assert.equal(div.dataset.query, "api.feature");
    assert.equal(div.dataset.depth, "1");
    assert.equal(
      div.textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs valid HTML", async (macro) => {
    macro.ctx.env["browser-compat"] = "api.feature";
    const result = await macro.call();
    expect(lintHTML(result)).toBeFalsy();
  });

  itMacro("Accepts an array", async (macro) => {
    macro.ctx.env["browser-compat"] = ["api.feature1", "api.feature2"];
    const result = await macro.call();
    const dom = JSDOM.fragment(result);
    assert.equal(dom.querySelectorAll("div.bc-data").length, 2);
    expect(lintHTML(result)).toBeFalsy();
  });
});
