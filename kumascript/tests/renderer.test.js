/**
 * @prettier
 */
const cheerio = require("cheerio");
const { Renderer } = require("../index.js");
const {
  MacroNotFoundError,
  MacroBrokenLinkError,
  MacroRedirectedLinkError,
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
    // Next, let's check the errors.
    expect(errors.length).toBe(3);
    expect(errors[0]).toBeInstanceOf(MacroNotFoundError);
    expect(errors[0]).toHaveProperty("line", 2);
    expect(errors[0]).toHaveProperty("column", 7);
    expect(errors[0]).toHaveProperty("macroName", "nonExistentMacro");
    expect(errors[0]).toHaveProperty(
      "errorMessage",
      "Unknown macro nonexistentmacro"
    );
    expect(errors[1]).toBeInstanceOf(MacroBrokenLinkError);
    expect(errors[1]).toHaveProperty("line", 1);
    expect(errors[1]).toHaveProperty("column", 1);
    expect(errors[1]).toHaveProperty(
      "errorMessage",
      "/en-US/docs/Web/CSS/bigfoot does not exist"
    );
    expect(errors[1]).toHaveProperty("macroName", "cssxref");
    expect(errors[1]).toHaveProperty("macroSource", '{{cssxref("bigfoot")}}');
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
  });
});
