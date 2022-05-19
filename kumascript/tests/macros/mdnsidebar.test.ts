/**
 * @prettier
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
const { assert, itMacro, describeMacro } = require("./utils");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jsdom'.
const jsdom = require("jsdom");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'locales'.
const locales = {
  "en-US": {
    About_MDN: "Contributing to MDN",
  },
  fr: {
    About_MDN: "Contribuer à MDN",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].About_MDN);
}

describeMacro("MDNSidebar", function () {
  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for fr", function (macro) {
    macro.ctx.env.locale = "fr";
    return macro.call().then(function (result) {
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "fr");
    });
  });
});
