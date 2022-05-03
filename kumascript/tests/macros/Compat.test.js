import { assert, itMacro, describeMacro, lintHTML } from "./utils.js";
import fs from "fs";
import path from "path";
import { jsdom } from "jsdom";
import extend from "extend";

import { fileURLToPath } from "url";
const dirname = path.dirname(fileURLToPath(import.meta.url));

const fixture_dir = path.resolve(dirname, "fixtures/compat");

let fixtureCompatData = {};
fs.readdirSync(fixture_dir).forEach(function (fn) {
  fixtureCompatData = extend(
    true,
    fixtureCompatData,
    JSON.parse(fs.readFileSync(path.resolve(fixture_dir, fn), "utf8"))
  );
});

describeMacro("Compat", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    const result = await macro.call("api.feature");
    const dom = jsdom.fragment(result);
    assert.equal(dom.querySelector("div.bc-data").id, "");
    assert.equal(dom.querySelector("div.bc-data").dataset.query, "api.feature");
    assert.equal(dom.querySelector("div.bc-data").dataset.depth, "1");
    assert.equal(
      dom.querySelector("div.bc-data").textContent.trim(),
      "If you're able to see this, something went wrong on this page."
    );
  });

  itMacro("Outputs the data-depth on the second parameter", async (macro) => {
    const result = await macro.call("api.feature", 2);
    const dom = jsdom.fragment(result);
    assert.equal(dom.querySelector("div.bc-data").dataset.depth, "2");
  });

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });
});
