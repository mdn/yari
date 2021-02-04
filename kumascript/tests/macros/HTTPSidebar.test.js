/**
 * @prettier
 */
const fs = require("fs");
const path = require("path");
const jsdom = require("jsdom");
const { Document } = require("../../../content");
const {
  assert,
  itMacro,
  beforeEachMacro,
  describeMacro,
  lintHTML,
} = require("./utils");

// Load fixture data.
const fixtureData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "fixtures", "documentData2.json"),
    "utf8"
  )
);

const locales = {
  "en-US": {
    ResourcesURI: "Resources and URIs",
  },
  es: {
    ResourcesURI: "Recursons y URIs",
  },
};

function checkSidebarDom(dom, locale) {
  const section = dom.querySelector("section");
  assert(
    section.classList.contains("Quick_links"),
    "Section does not contain Quick_links class"
  );

  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].ResourcesURI);
}

describeMacro("HTTPSidebar", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTTP/Overview";
    Document.findByURL = jest.fn((url) => {
      const data = fixtureData[url.toLowerCase()];
      if (!data) {
        return null;
      }
      return {
        url: data.url,
        metadata: {
          title: data.title,
          locale: data.locale,
          summary: data.summary,
          slug: data.slug,
          tags: data.tags,
        },
      };
    });
    Document.findChildren = jest.fn((url) => {
      const result = [];
      const parent = `${url.toLowerCase()}/`;
      for (const [key, data] of Object.entries(fixtureData)) {
        if (!key.replace(parent, "").includes("/")) {
          key.replace(`${url.toLowerCase()}/`, "");
          result.push({
            url: data.url,
            metadata: {
              title: data.title,
              locale: data.locale,
              summary: data.summary,
              slug: data.slug,
              tags: data.tags,
            },
          });
        }
      }
      return result;
    });
  });

  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      expect(lintHTML(result)).toBeFalsy();
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for es", function (macro) {
    macro.ctx.env.locale = "es";
    return macro.call().then(function (result) {
      expect(lintHTML(result)).toBeFalsy();
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "es");
    });
  });
});
