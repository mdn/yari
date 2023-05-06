import { assert, itMacro, describeMacro } from "./utils.js";

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
});
