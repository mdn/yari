import fs from "node:fs";
import { JSDOM } from "jsdom";
import { jest } from "@jest/globals";
import * as Content from "../../../content/index.js";

jest.unstable_mockModule("../../../content/index.js", () => ({
  ...Content,
  Document: {
    ...Content.Document,
    findByURL: jest.fn((url: string) => {
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
    }),
    findChildren: jest.fn((url: string) => {
      const result: any[] = [];
      const parent = `${url.toLowerCase()}/`;
      for (const [key, data] of Object.entries(fixtureData) as any) {
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
    }),
  },
}));

const { assert, itMacro, beforeEachMacro, describeMacro, lintHTML } =
  await import("./utils.js");

// Load fixture data.
const fixtureData = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/documentData2.json", import.meta.url),
    "utf-8"
  )
) as any;

const locales = {
  "en-US": {
    ResourcesURI: "HTTP concepts",
  },
  es: {
    ResourcesURI: "Guía de HTTP",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].ResourcesURI);
}

describeMacro("HTTPSidebar", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTTP/Overview";
    // Mock calls to env.recordNonFatalError, called from web.smartLink().
    macro.ctx.env.recordNonFatalError = () => {
      return {
        macroSource: "foo",
      };
    };
  });

  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(async function (result) {
      expect(await lintHTML(result)).toBeFalsy();
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for es", function (macro) {
    macro.ctx.env.locale = "es";
    return macro.call().then(async function (result) {
      expect(await lintHTML(result)).toBeFalsy();
      const dom = JSDOM.fragment(result);
      checkSidebarDom(dom, "es");
    });
  });
});
