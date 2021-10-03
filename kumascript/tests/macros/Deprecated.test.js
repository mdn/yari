/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require("./utils");

// TODO: Add tests for other {{Deprecated_*}} macros
describeMacro("Deprecated_Inline", function () {
  itMacro("No arguments (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call(),
      `<svg class="icon icon-deprecated" tabindex="0">
    <use xlink:href="/assets/badges.svg#icon-deprecated"></use>
</svg>`
    );
  });
  itMacro('"semver" string only (en-US)', function (macro) {
    return assert.eventually.equal(
      macro.call("1.9.2"),
      `<span class="notecard inline deprecated" title="(Firefox 3.6 / Thunderbird 3.1 / Fennec 1.0)">Deprecated since Gecko 1.9.2</span>`
    );
  });
  itMacro("Numeric version only (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call(45),
      `<span class="notecard inline deprecated" title="(Firefox 45 / Thunderbird 45 / SeaMonkey 2.42)">Deprecated since Gecko 45</span>`
    );
  });
  itMacro("Gecko-prefixed version (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call("gecko45"),
      `<span class="notecard inline deprecated" title="(Firefox 45 / Thunderbird 45 / SeaMonkey 2.42)">Deprecated since Gecko 45</span>`
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
