/**
 * @prettier
 */
const cheerio = require("cheerio");
const { Renderer } = require("../index.js");
const {
  MacroNotFoundError,
  MacroBrokenLinkError,
  MacroRedirectedLinkError,
  MacroDeprecatedError,
} = require("../src/errors.js");

describe("testing the Renderer class", () => {
  it("non-fatal errors in macros are returned by render()", async () => {
    const renderer = new Renderer({
      uriTransform: (uri) => {
        let result = uri.toLowerCase();
        if (result === "/en-us/docs/web/css/dumber") {
          return "/en-us/docs/web/css/number";
        }
        return result;
      },
    });
    const pageInfoByUri = new Map();
    const pageInfo = {
      mdn_url: "/en-US/docs/Web/CSS/number",
      title: "<number>",
      locale: "en-US",
      summary: "This is the number test page.",
      slug: "Web/CSS/number",
      tags: ["CSS", "CSS Data Type", "Layout", "Reference", "Web"],
    };
    pageInfoByUri.set("/en-us/docs/web/css/number", pageInfo);
    renderer.use(pageInfoByUri);
    const source = `
      {{cssxref("bigfoot")}}
      {{nonExistentMacro("yada")}}
      {{cssxref("dumber")}}
      {{cssxref("number")}}
      <p id="fx-header">{{fx_minversion_header("36")}}</p>
      <p id="fx-inline">{{fx_minversion_inline("36")}}</p>
      <p id="gecko-header">{{gecko_minversion_header("36")}}</p>
      <p id="gecko-inline">{{gecko_minversion_inline("36")}}</p>
    `.trim();
    const pageEnvironment = {
      locale: "en-US",
      path: "/en-US/docs/Web/Foobar",
    };
    let [result, errors] = await renderer.render(source, pageEnvironment);
    // First, let's check the result.
    expect(result).toEqual(
      expect.stringContaining("{{nonExistentMacro(&quot;yada&quot;)}}")
    );
    const $ = cheerio.load(result);
    const brokenLink = $(
      'a.new[title^="The documentation about this has not yet been written"]'
    );
    expect(brokenLink.length).toBe(1);
    expect(brokenLink.html()).toBe("<code>bigfoot</code>");
    const otherLinks = $(
      `a[href="${pageInfo.mdn_url}"][title="${pageInfo.summary}"]`
    );
    expect(otherLinks.length).toBe(2);
    expect(otherLinks.eq(0).html()).toBe("<code>&lt;dumber&gt;</code>");
    expect(otherLinks.eq(1).html()).toBe("<code>&lt;number&gt;</code>");
    for (deprecatedID of [
      "fx-header",
      "fx-inline",
      "gecko-header",
      "gecko-inline",
    ]) {
      const deprecated = $(`#${deprecatedID}`);
      expect(deprecated.length).toBe(1);
      expect(deprecated.html()).toBe("");
    }
    // Next, let's check the errors.
    expect(errors.length).toBe(7);
    expect(errors[0]).toBeInstanceOf(MacroBrokenLinkError);
    expect(errors[0]).toHaveProperty("line", 1);
    expect(errors[0]).toHaveProperty("column", 1);
    expect(errors[0]).toHaveProperty(
      "errorMessage",
      "/en-US/docs/Web/CSS/bigfoot does not exist"
    );
    expect(errors[0]).toHaveProperty("macroName", "cssxref");
    expect(errors[0]).toHaveProperty("macroSource", '{{cssxref("bigfoot")}}');
    expect(errors[1]).toBeInstanceOf(MacroNotFoundError);
    expect(errors[1]).toHaveProperty("line", 2);
    expect(errors[1]).toHaveProperty("column", 7);
    expect(errors[1]).toHaveProperty("macroName", "nonExistentMacro");
    expect(errors[1]).toHaveProperty(
      "errorMessage",
      "Unknown macro nonexistentmacro"
    );
    expect(errors[2]).toBeInstanceOf(MacroRedirectedLinkError);
    expect(errors[2]).toHaveProperty("line", 3);
    expect(errors[2]).toHaveProperty("column", 7);
    expect(errors[2]).toHaveProperty(
      "errorMessage",
      "/en-US/docs/Web/CSS/dumber redirects to /en-US/docs/Web/CSS/number"
    );
    expect(errors[2]).toHaveProperty("macroName", "cssxref");
    expect(errors[2]).toHaveProperty("macroSource", '{{cssxref("dumber")}}');
    expect(errors[2]).toHaveProperty("redirectInfo.current", "dumber");
    expect(errors[2]).toHaveProperty("redirectInfo.suggested", "number");
    expect(errors[3]).toBeInstanceOf(MacroDeprecatedError);
    expect(errors[3]).toHaveProperty("line", 5);
    expect(errors[3]).toHaveProperty("column", 25);
    expect(errors[3]).toHaveProperty("macroName", "fx_minversion_header");
    expect(errors[3]).toHaveProperty(
      "errorMessage",
      "This macro has been deprecated, and should be removed."
    );
    expect(errors[4]).toBeInstanceOf(MacroDeprecatedError);
    expect(errors[4]).toHaveProperty("line", 6);
    expect(errors[4]).toHaveProperty("column", 25);
    expect(errors[4]).toHaveProperty("macroName", "fx_minversion_inline");
    expect(errors[4]).toHaveProperty(
      "errorMessage",
      "This macro has been deprecated, and should be removed."
    );
    expect(errors[5]).toBeInstanceOf(MacroDeprecatedError);
    expect(errors[5]).toHaveProperty("line", 7);
    expect(errors[5]).toHaveProperty("column", 28);
    expect(errors[5]).toHaveProperty("macroName", "gecko_minversion_header");
    expect(errors[5]).toHaveProperty(
      "errorMessage",
      "This macro has been deprecated, and should be removed."
    );
    expect(errors[6]).toBeInstanceOf(MacroDeprecatedError);
    expect(errors[6]).toHaveProperty("line", 8);
    expect(errors[6]).toHaveProperty("column", 28);
    expect(errors[6]).toHaveProperty("macroName", "gecko_minversion_inline");
    expect(errors[6]).toHaveProperty(
      "errorMessage",
      "This macro has been deprecated, and should be removed."
    );
  });
});
