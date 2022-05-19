import { assert, itMacro, describeMacro, lintHTML } from "./utils";

import fs from "fs";
import path from "path";
import jsdom from "jsdom";
import extend from "extend";
const dirname = new URL(".", import.meta.url).pathname;
const fixture_dir = path.resolve(dirname, "fixtures/compat");

const { JSDOM } = jsdom;

let fixtureCompatData = {};
fs.readdirSync(fixture_dir).forEach(function (fn) {
  fixtureCompatData = extend(
    true,
    fixtureCompatData,
    JSON.parse(fs.readFileSync(path.resolve(fixture_dir, fn), "utf-8"))
  );
});

describeMacro("Compat", function () {
  itMacro("Outputs a simple div tag", async (macro) => {
    const result = await macro.call("api.feature");
    const dom = JSDOM.fragment(result);
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
    const dom = JSDOM.fragment(result);
    assert.equal(dom.querySelector("div.bc-data").dataset.depth, "2");
  });

  itMacro("Outputs valid HTML", async (macro) => {
    const result = await macro.call("api.feature");
    expect(lintHTML(result)).toBeFalsy();
  });

  itMacro("Accepts an array", async (macro) => {
    const result = await macro.call(["api.feature1", "api.feature2"]);
    const dom = JSDOM.fragment(result);
    assert.equal(dom.querySelectorAll("div.bc-data").length, 2);
    expect(lintHTML(result)).toBeFalsy();
  });
});
