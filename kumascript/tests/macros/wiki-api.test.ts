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
    assert.isFunction(pkg.uri);
    assert.isFunction(pkg.tree);
  });
  describe('test "uri"', function () {
    itMacro('with "/docs", leading "/", spaces', function (macro) {
      macro.ctx.env.url = "/en-US/docs/Web";
      assert.equal(
        macro.ctx.wiki.uri(
          "/en-US/docs/Learn/Getting started%20with the%20web"
        ),
        "/en-US/docs/Learn/Getting_started_with_the_web"
      );
    });
    itMacro('without "/docs", leading "/", spaces', function (macro) {
      macro.ctx.env.url = "/en-US/docs/Learn";
      assert.equal(macro.ctx.wiki.uri("Web/HTTP"), "/en-US/docs/Web/HTTP");
    });
    itMacro('with "/docs", leading "/", spaces, query', function (macro) {
      macro.ctx.env.url = "/en-US/docs/Web";
      assert.equal(
        macro.ctx.wiki.uri(
          "/en-US/docs/Learn/Getting started%20with the%20web",
          "raw=1"
        ),
        "/en-US/docs/Learn/Getting_started_with_the_web?raw=1"
      );
    });
  });
});
