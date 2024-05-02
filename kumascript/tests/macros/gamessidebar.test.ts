import { assert, itMacro, describeMacro } from "./utils.js";
import { JSDOM } from "jsdom";

const locales = {
  "en-US": {
    Introduction: "Introduction",
  },
  ja: {
    Introduction: "Web のゲーム開発紹介",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].Introduction);
}

function mock(macro) {
  macro.ctx.env.recordNonFatalError = () => {
    return {
      macroSource: "foo",
    };
  };
}

describeMacro("GamesSidebar", function () {
  itMacro("Creates a sidebar object for en-US", function (macro) {
    mock(macro);
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for ja", function (macro) {
    mock(macro);
    macro.ctx.env.locale = "ja";
    return macro.call().then(function (result) {
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "ja");
    });
  });
});
