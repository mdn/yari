import { assert, itMacro, describeMacro } from "./utils.js";

describeMacro("EmbedInteractiveExample", function () {
  itMacro("Typical settings and argument", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/css/animation.html"),
      `<h2>Try it</h2>
<iframe class="interactive is-default-height" height="200" src="https://interactive-examples.mdn.mozilla.net/pages/css/animation.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("Changes in settings and argument are reflected", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://www.fleetwood-mac.com",
    };
    return assert.eventually.equal(
      macro.call("pages/http/headers.html"),
      `<h2>Try it</h2>
<iframe class="interactive is-default-height" height="200" src="https://www.fleetwood-mac.com/pages/http/headers.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro(
    "Trailing slash in setting and leading slash in argument",
    function (macro) {
      macro.ctx.env.interactive_examples = {
        base_url: "https://interactive-examples.mdn.mozilla.net/",
      };
      return assert.eventually.equal(
        macro.call("/pages/css/animation.html"),
        `<h2>Try it</h2>
<iframe class="interactive is-default-height" height="200" src="https://interactive-examples.mdn.mozilla.net/pages/css/animation.html" title="MDN Web Docs Interactive Example"></iframe>`
      );
    }
  );
  itMacro("Javascript pages get an extra class by default", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/js/expressions-conditionaloperators.html"),
      `<h2>Try it</h2>
<iframe class="interactive is-js-height" height="200" src="https://interactive-examples.mdn.mozilla.net/pages/js/expressions-conditionaloperators.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("An extra class can be passed as an argument", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/http/headers.html", "taller"),
      `<h2>Try it</h2>
<iframe class="interactive is-taller-height" height="200" src="https://interactive-examples.mdn.mozilla.net/pages/http/headers.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
});
