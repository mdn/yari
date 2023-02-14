import { jest } from "@jest/globals";

import * as Content from "../../content/index.js";
import {
  MacroNotFoundError,
  MacroBrokenLinkError,
  MacroRedirectedLinkError,
} from "../src/errors.js";

const source = `
{{cssxref("bigfoot")}}
{{nonExistentMacro("yada")}}
{{cssxref("dumber")}}
{{cssxref("number")}}
`.trim();

const findByURL = jest.fn((url: string) => {
  return {
    "/en-us/docs/web/a": {
      url: "/en-US/docs/Web/A",
      metadata: {
        title: "A",
        locale: "en-US",
        slug: "Web/A",
        tags: ["Web"],
      },
      rawBody: source,
      isMarkdown: false,
      fileInfo: {
        path: "testing/content/files/en-us/web/a",
        frontMatterOffset: 8,
      },
    },
    "/en-us/docs/web/b": {
      url: "/en-US/docs/Web/B",
      metadata: {
        title: "B",
        locale: "en-US",
        slug: "Web/B",
        tags: ["Web"],
      },
      rawBody: '<p>{{cssxref("bigfoot")}}</p>',
      isMarkdown: false,
      fileInfo: {
        path: "testing/content/files/en-us/web/b",
        frontMatterOffset: 4,
      },
    },
    "/en-us/docs/web/css/number": {
      url: "/en-US/docs/Web/CSS/number",
      metadata: {
        title: "<number>",
        locale: "en-US",
        slug: "Web/Number",
        "page-type": "css-type",
      },
      rawBody: "<p>This is the number test page.</p>",
      isMarkdown: false,
      fileInfo: {
        path: "testing/content/files/en-us/web/css/number",
        frontMatterOffset: 12,
      },
    },
  }[url];
});

jest.unstable_mockModule("../../content/index.js", () => ({
  ...Content,
  Document: {
    ...Content.Document,
    findByURL,
  },
}));

// Depends on mocking Document.findByURL
const { default: info } = await import("../src/info.js");

const cleanURL = jest.fn((url: string) => {
  const result = url.toLowerCase();
  if (result === "/en-us/docs/web/css/dumber") {
    return "/en-us/docs/web/css/number";
  }
  return result;
});

jest.unstable_mockModule("../src/info.js", () => ({
  default: {
    ...info,
    cleanURL,
    getPageByURL: jest.fn((url: string) => {
      const document = findByURL(cleanURL(url));
      return document ? info.getPage(document) : {};
    }),
  },
}));

// Depends on module mocking
const { render } = await import("../index.js");

describe("testing the main render() function", () => {
  it("non-fatal errors in macros are returned by render()", async () => {
    const [$, errors] = await render("/en-us/docs/web/a");
    const result = $.html();
    // First, let's check the result.
    expect(result).toEqual(
      expect.stringContaining('{{nonExistentMacro("yada")}}')
    );
    const brokenLink = $(
      'a.page-not-created[title^="The documentation about this has not yet been written"]'
    );
    expect(brokenLink).toHaveLength(1);
    expect(brokenLink.html()).toBe("<code>bigfoot</code>");
    const otherLinks = $(`a[href="/en-US/docs/Web/CSS/number"]`);
    expect(otherLinks).toHaveLength(2);
    expect(otherLinks.eq(0).html()).toBe("<code>&lt;dumber&gt;</code>");
    expect(otherLinks.eq(1).html()).toBe("<code>&lt;number&gt;</code>");
    // Next, let's check the errors.
    expect(errors).toHaveLength(3);

    expect(errors[0]).toBeInstanceOf(MacroBrokenLinkError);
    expect(errors[0]).toMatchObject({
      line: 8,
      column: 1,
      filepath: "testing/content/files/en-us/web/a",
      errorStack: expect.stringContaining(
        "/en-US/docs/Web/CSS/bigfoot does not exist"
      ),
      macroName: "cssxref",
      macroSource: '{{cssxref("bigfoot")}}',
    });

    expect(errors[1]).toBeInstanceOf(MacroNotFoundError);
    expect(errors[1]).toMatchObject({
      line: 9,
      column: 1,
      filepath: "testing/content/files/en-us/web/a",
      macroName: "nonExistentMacro",
      errorStack: expect.stringContaining("Unknown macro nonexistentmacro"),
    });

    expect(errors[2]).toBeInstanceOf(MacroRedirectedLinkError);
    expect(errors[2]).toMatchObject({
      line: 10,
      column: 1,
      filepath: "testing/content/files/en-us/web/a",
      errorStack: expect.stringContaining(
        "/en-US/docs/Web/CSS/dumber redirects to /en-US/docs/Web/CSS/number"
      ),
      macroName: "cssxref",
      macroSource: '{{cssxref("dumber")}}',
      redirectInfo: {
        current: "dumber",
        suggested: "number",
      },
    });
  });
});
