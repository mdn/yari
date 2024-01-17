import { assert, itMacro, describeMacro } from "./utils.js";
import { JSDOM } from "jsdom";

const locales = {
  "en-US": {
    community_guidelines: "Community guidelines",
  },
  fr: {
    community_guidelines: "Règles de la communauté",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[2].textContent, locales[locale].community_guidelines);
}

describeMacro("MDNSidebar", function () {
  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for fr", function (macro) {
    macro.ctx.env.locale = "fr";
    return macro.call().then(function (result) {
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "fr");
    });
  });
});
