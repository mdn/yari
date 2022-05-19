/**
 * @prettier
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'jsdom'.
const jsdom = require("jsdom");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const { Document } = require("../../../content");
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'assert'.
  assert,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'itMacro'.
  itMacro,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'beforeEach... Remove this comment to see the full error message
  beforeEachMacro,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'describeMa... Remove this comment to see the full error message
  describeMacro,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'lintHTML'.
  lintHTML,
} = require("./utils");

const dirname = __dirname;

// Load fixture data.
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fixtureDat... Remove this comment to see the full error message
const fixtureData = JSON.parse(
  fs.readFileSync(
    path.resolve(dirname, "fixtures", "documentData2.json"),
    "utf8"
  )
);

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'locales'.
const locales = {
  "en-US": {
    ResourcesURI: "Resources and URIs",
  },
  es: {
    ResourcesURI: "Recursons y URIs",
  },
};

// @ts-expect-error ts-migrate(2393) FIXME: Duplicate function implementation.
function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].ResourcesURI);
}

describeMacro("HTTPSidebar", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTTP/Overview";
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findByURL' does not exist on type '{ new... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findChildren' does not exist on type '{ ... Remove this comment to see the full error message
    Document.findChildren = jest.fn((url) => {
      const result = [];
      const parent = `${url.toLowerCase()}/`;
      for (const [key, data] of Object.entries(fixtureData)) {
        if (!key.replace(parent, "").includes("/")) {
          key.replace(`${url.toLowerCase()}/`, "");
          result.push({
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'url' does not exist on type 'unknown'.
            url: data.url,
            metadata: {
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type 'unknown'.
              title: data.title,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'locale' does not exist on type 'unknown'... Remove this comment to see the full error message
              locale: data.locale,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'summary' does not exist on type 'unknown... Remove this comment to see the full error message
              summary: data.summary,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'slug' does not exist on type 'unknown'.
              slug: data.slug,
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'tags' does not exist on type 'unknown'.
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
