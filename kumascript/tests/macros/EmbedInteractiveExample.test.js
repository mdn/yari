/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require("./utils");

describeMacro("EmbedInteractiveExample", function () {
  itMacro("Typical settings and argument", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/css/animation.html"),
      `<iframe class="interactive" width="100%" height="250" frameborder="0" src="https://interactive-examples.mdn.mozilla.net/pages/css/animation.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("Changes in settings and argument are reflected", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://www.fleetwood-mac.com",
    };
    return assert.eventually.equal(
      macro.call("pages/http/headers.html"),
      `<iframe class="interactive" width="100%" height="250" frameborder="0" src="https://www.fleetwood-mac.com/pages/http/headers.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("Trailing slash in setting and leading slash in argument", function (
    macro
  ) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net/",
    };
    return assert.eventually.equal(
      macro.call("/pages/css/animation.html"),
      `<iframe class="interactive" width="100%" height="250" frameborder="0" src="https://interactive-examples.mdn.mozilla.net/pages/css/animation.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("Javascript pages get an extra class by default", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/js/expressions-conditionaloperators.html"),
      `<iframe class="interactive interactive-js" width="100%" height="250" frameborder="0" src="https://interactive-examples.mdn.mozilla.net/pages/js/expressions-conditionaloperators.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("An extra class can be passed as an argument", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/http/headers.html", "extra"),
      `<iframe class="interactive extra" width="100%" height="250" frameborder="0" src="https://interactive-examples.mdn.mozilla.net/pages/http/headers.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
  itMacro("Javascript pages can also add an extra class", function (macro) {
    macro.ctx.env.interactive_examples = {
      base_url: "https://interactive-examples.mdn.mozilla.net",
    };
    return assert.eventually.equal(
      macro.call("pages/js/expressions-conditionaloperators.html", "bigger"),
      `<iframe class="interactive interactive-js bigger" width="100%" height="250" frameborder="0" src="https://interactive-examples.mdn.mozilla.net/pages/js/expressions-conditionaloperators.html" title="MDN Web Docs Interactive Example"></iframe>`
    );
  });
});
