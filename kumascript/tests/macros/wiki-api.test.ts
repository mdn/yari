// There used to be a DekiScript-Wiki.ejs macro, tested by this file.
// The functions defined by that macro have been moved to
// ../../src/environment.js, but the tests that are still relevant remain here.

import { assert, itMacro, describeMacro } from "./utils.js";

describeMacro("dekiscript-wiki", function () {
  itMacro("basic API", function (macro) {
    const pkg = macro.ctx.wiki;
    assert.isObject(pkg);
    assert.isFunction(pkg.escapeQuotes);
    assert.isFunction(pkg.page);
    assert.isFunction(pkg.getPage);
    assert.isFunction(pkg.tree);
  });
});
