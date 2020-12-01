/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require("./utils");

// TODO: Add tests for other {{Deprecated_*}} macros
describeMacro("Deprecated_Inline", function () {
  itMacro("No arguments (en-US)", function (macro) {
    return assert.eventually.equal(
      macro.call(),
      `<svg class="icon deprecated" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
    role="img">
    <title>This deprecated API should no longer be used, but will probably still work.</title>
    <path
        d="M19.4 24.8a3.6 3.6 0 11-7.2 0 3.6 3.6 0 117.2 0zm9 28.8v-36a3.62 3.62 0 00-3.6-3.6H8.6A3.62 3.62 0 005 17.6v36a3.62 3.62 0 003.6 3.6h16.2a3.62 3.62 0 003.6-3.6zm63.51-8.38A13.16 13.16 0 0195 53.6a11 11 0 01-10.8 10.8H68.62a13.47 13.47 0 001.63 3.6c1.46 2.92 3.15 6.19 3.15 10.8 0 4.33 0 14.4-12.6 14.4a3.54 3.54 0 01-2.53-1.07c-2.42-2.36-3.1-5.85-3.71-9.17s-1.3-6.64-3.49-8.83a75.84 75.84 0 01-5.68-6.75c-2.48-3.26-7.88-10-10-10.12a3.76 3.76 0 01-3.39-3.6V17.6a3.71 3.71 0 013.6-3.6c2-.06 5.34-1.24 8.89-2.47C50.56 9.44 58.16 6.8 66.2 6.8h7.26c5 .06 8.66 1.52 11.08 4.39 2.13 2.53 3.09 6 2.75 10.18a11.47 11.47 0 013 5.29 11.87 11.87 0 010 6.58 11.87 11.87 0 012.42 7.7 15.2 15.2 0 01-.84 4.28z"
        fill="currentColor" />
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
