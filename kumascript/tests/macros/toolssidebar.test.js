/**
 * @prettier
 */

const { assert, itMacro, describeMacro, lintHTML } = require("./utils");
const jsdom = require("jsdom");

const locales = {
  "en-US": {
    Page_Inspector: "Page Inspector",
  },
  fr: {
    Page_Inspector: "Inspecteur",
  },
};

function checkSidebarDom(dom, locale) {
  const listItems = dom.querySelectorAll("li");
  assert.equal(listItems[0].textContent, locales[locale].Page_Inspector);
}

describeMacro("ToolsSidebar", function () {
  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      expect(lintHTML(result)).toBeFalsy();
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for fr", function (macro) {
    macro.ctx.env.locale = "fr";
    return macro.call().then(function (result) {
      expect(lintHTML(result)).toBeFalsy();
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "fr");
    });
  });
});
