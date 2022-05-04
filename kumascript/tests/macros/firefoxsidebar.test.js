/**
 * @prettier
 */
const { assert, itMacro, describeMacro } = require("./utils");
const jsdom = require("jsdom");

const locales = {
  "en-US": {
    Firefox_releases: "Firefox releases",
  },
  fr: {
    Firefox_releases: "Versions de Firefox",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].Firefox_releases);
}

describeMacro("FirefoxSidebar", function () {
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
