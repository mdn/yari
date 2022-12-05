import { assert, itMacro, describeMacro } from "./utils";

// TODO: Add tests for other {{Deprecated_*}} macros
describeMacro("Deprecated_Inline", function () {
  itMacro("No arguments (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call(),
      `<abbr class="icon icon-deprecated" title="Deprecated. Not for use in new websites.">
    <span class="visually-hidden">Deprecated</span>
</abbr>`
    );
  });
  itMacro("HTML-prefixed version (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("html4"),
      `<span class="notecard inline deprecated" title="">Deprecated since <a href="/en-US/docs/HTML">HTML4</a></span>`
    );
  });
  itMacro("JS-prefixed version (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("js1.7"),
      `<span class="notecard inline deprecated" title="">Deprecated since <a href="/en-US/docs/JavaScript/New_in_JavaScript/1.7">JavaScript 1.7</a></span>`
    );
  });
  itMacro("CSS-prefixed version (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("css2"),
      `<span class="notecard inline deprecated" title="">Deprecated since CSS 2</span>`
    );
  });
  itMacro("CSS-prefixed version (ja)", function (macro) {
    macro.ctx.env.locale = "ja";
    return assert.eventually.equal(
      macro.call("css2"),
      `<span class="notecard inline deprecated" title="">非推奨 CSS 2</span>`
    );
  });
  itMacro("Nonsense-prefixed version (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("foobar13"),
      `<span class="notecard inline deprecated" title="">Deprecated</span>`
    );
  });
});
