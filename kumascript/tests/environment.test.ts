import { jest } from "@jest/globals";
import Environment from "../src/environment.js";

// We test using `with` because that is what EJS uses. But Jest
// runs tests in strict mode, so we have to hide the with inside
// a Function() call.
const getValue = new Function("c", "p", "with(c) return eval(p)");

const expectedObjects = [
  "env",
  "mdn",
  "MDN",
  "wiki",
  "Wiki",
  "web",
  "Web",
  "page",
  "Page",
];

const expectedFunctions = [
  "require",
  "Require",
  "template",

  "mdn.htmlEscape",
  "MDN.HtmlEscape",
  "mdn.htmlEscape",
  "MDN.HtmlEscape",
  "mdn.htmlEscapeArgs",
  "MDN.htmlEscapeArgs",
  "MDN.htmlescapeargs",
  "mdn.localString",
  "MDN.localString",
  "MDN.localstring",
  "mdn.localStringMap",
  "MDN.localStringMap",
  "MDN.localstringmap",
  "mdn.getLocalString",
  "MDN.getLocalString",
  "MDN.getlocalstring",
  "mdn.replacePlaceholders",
  "MDN.replacePlaceholders",
  "MDN.replaceplaceholders",
  "mdn.escapeQuotes",
  "MDN.escapeQuotes",
  "MDN.escapequotes",

  "wiki.escapeQuotes",
  "Wiki.escapeQuotes",
  "wiki.escapequotes",
  "wiki.page",
  "Wiki.page",
  "wiki.page",
  "wiki.getPage",
  "Wiki.getPage",
  "wiki.getpage",
  "wiki.tree",
  "Wiki.tree",
  "wiki.tree",

  "web.link",
  "Web.Link",
  "web.Link",
  "Web.link",
  "web.spacesToUnderscores",
  "Web.SpacesToUnderscores",

  "page.hasTag",
  "Page.hasTag",
  "page.hastag",
  "page.subpagesExpand",
  "Page.subpagesExpand",
  "page.subpagesexpand",
  "page.translations",
  "Page.translations",
];

const expectedAsync = ["wiki.page", "template"];

describe("Environment class", () => {
  it.each(expectedObjects)("defines global object %s", (global) => {
    const environment = new Environment({});
    const context = environment.getExecutionContext([]);
    expect(typeof getValue(context, global)).toBe("object");
  });

  it.each(expectedFunctions)("defines global function %s", (global) => {
    const environment = new Environment({});
    const context = environment.getExecutionContext([]);
    expect(typeof getValue(context, global)).toBe("function");
  });

  it.each(expectedAsync)("defines async function %s", (global) => {
    const environment = new Environment({});
    const context = environment.getExecutionContext([]);
    const value = getValue(context, global);
    expect(typeof value).toBe("function");
    expect(value.constructor.name).toBe("AsyncFunction");
  });

  it("defines values from the environment object", () => {
    const environment = new Environment({
      locale: "en-CA",
      tags: ["a", "b", "c"],
      title: "This is a test",
      url: "Hello World",
      x: 1,
      mdn: 2,
    });
    const context = environment.getExecutionContext([]);
    expect(getValue(context, "env.locale")).toBe("en-CA");
    expect(getValue(context, "page.language")).toBe("en-CA");
    expect(getValue(context, "env.tags")).toEqual(["a", "b", "c"]);
    expect(getValue(context, "page.tags")).toEqual(["a", "b", "c"]);
    expect(getValue(context, "env.title")).toBe("This is a test");
    expect(getValue(context, "page.title")).toBe("This is a test");
    expect(getValue(context, "env.url")).toBe("Hello World");
    expect(getValue(context, "page.uri")).toBe("Hello World");
    expect(getValue(context, "env.x")).toBe(1);
    expect(getValue(context, "env.mdn")).toBe(2);
  });

  it("defines values from arguments array", () => {
    const environment = new Environment({});

    // array of string arguments
    let context = environment.getExecutionContext(["a", "b", "c"]);
    expect(getValue(context, "arguments")).toEqual(["a", "b", "c"]);
    expect(getValue(context, "$$")).toEqual(["a", "b", "c"]);
    expect(getValue(context, "$0")).toBe("a");
    expect(getValue(context, "$1")).toBe("b");
    expect(getValue(context, "$2")).toBe("c");
    expect(getValue(context, "$3")).toBe("");
    expect(getValue(context, "$4")).toBe("");
    expect(getValue(context, "$5")).toBe("");
    expect(getValue(context, "$6")).toBe("");
    expect(getValue(context, "$7")).toBe("");
    expect(getValue(context, "$8")).toBe("");
    expect(getValue(context, "$9")).toBe("");

    // single json object argument
    context = environment.getExecutionContext([{ x: 1, y: 2 }]);
    expect(getValue(context, "arguments")).toEqual([{ x: 1, y: 2 }]);
    expect(getValue(context, "$$")).toEqual([{ x: 1, y: 2 }]);
    expect(getValue(context, "$0")).toEqual({ x: 1, y: 2 });
    expect(getValue(context, "$0.x")).toBe(1);
    expect(getValue(context, "$0.y")).toBe(2);
    expect(getValue(context, "$1")).toBe("");
    expect(getValue(context, "$2")).toBe("");
    expect(getValue(context, "$4")).toBe("");
    expect(getValue(context, "$5")).toBe("");
    expect(getValue(context, "$6")).toBe("");
    expect(getValue(context, "$7")).toBe("");
    expect(getValue(context, "$8")).toBe("");
    expect(getValue(context, "$9")).toBe("");
  });

  it("defines a template() function that renders templates", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockRender = jest.fn((a, b) => "hello world");
    const mockTemplates = { render: mockRender };
    const environment = new Environment({}, mockTemplates);
    const context = environment.getExecutionContext([]);
    const templateFunction = getValue(context, "template");

    const rendered = await templateFunction("foo", ["1", "2"]);

    expect(rendered).toBe("hello world");
    expect(mockRender.mock.calls).toHaveLength(1);
    expect(mockRender.mock.calls[0][0]).toBe("foo");
    expect(getValue(mockRender.mock.calls[0][1], "$0")).toBe("1");
    expect(getValue(mockRender.mock.calls[0][1], "$1")).toBe("2");
  });
});
