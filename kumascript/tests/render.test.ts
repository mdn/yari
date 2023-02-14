import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { jest } from "@jest/globals";

import Templates from "../src/templates.js";
import { render } from "../src/render.js";
import {
  MacroInvocationError,
  MacroNotFoundError,
  MacroCompilationError,
  MacroExecutionError,
} from "../src/errors.js";

const PAGE_ENV = { slug: "" };

describe("render() function", () => {
  function fixture(name) {
    return fileURLToPath(new URL(`./fixtures/render/${name}`, import.meta.url));
  }
  function get(name) {
    return fs.readFileSync(fixture(name), "utf-8");
  }
  function renderPrerequisiteFromURL(url) {
    throw new Error(`unexpected prerequisite: ${url}`);
  }

  it("is a function", () => {
    expect(typeof render).toBe("function");
  });

  const cases = ["testcase1", "testcase2", "testcase3", "testcase4"];
  it.each(cases)("handles basic rendering %s", async (casedir) => {
    const input = get(`${casedir}/input`);
    const expected = get(`${casedir}/output`);
    const templates = new Templates(fixture(`${casedir}/macros`));
    const [result, errors] = await render(
      input,
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual(expected);
    expect(errors).toEqual([]);
  });

  it.each(["render", "remove"])("handles selective %s", async (mode) => {
    const input = get("testcase2/input");
    const expected = get(`testcase2/output_selective_${mode}`);
    const templates = new Templates(fixture("testcase2/macros"));
    const pageEnv = {
      ...PAGE_ENV,
      selective_mode: [mode, ["Multi:Line:Macro", "頁尾附註", "MacroWithJson"]],
    };
    const [result, errors] = await render(
      input,
      pageEnv,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual(expected);
    expect(errors).toEqual([]);
  });

  it("renders asynchronous macros", async () => {
    jest.useFakeTimers();
    async function after(delay, value) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(value), delay);
      });
    }

    const templates = new Templates(fixture("macros"));
    const promise = render(
      "{{asyncMacro}}",
      { ...PAGE_ENV, after },
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    jest.runAllTimers();
    const [result, errors] = await promise;
    expect(errors).toHaveLength(0);
    expect(result).toEqual("yay!");
  });

  it("exposes the per-page env object", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "{{env}}",
      {
        ...PAGE_ENV,
        x: 1,
        y: 2,
      },
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(errors).toHaveLength(0);
    expect(result).toEqual("3");
  });

  const syntaxCases = ["syntax1", "syntax2", "syntax3", "syntax4"];
  it.each(syntaxCases)("handles syntax errors: %s", async (fn) => {
    const input = get(fn);
    // null templates since we expect errors before we render any
    expect.assertions(4);
    try {
      await render(input, PAGE_ENV, renderPrerequisiteFromURL, {
        templates: null,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(MacroInvocationError);
      const e = error as MacroInvocationError;
      expect(e.name).toBe("MacroInvocationError");
      expect(e).toHaveProperty("line");
      expect(e).toHaveProperty("column");
    }
  });

  it("handles undefined templates", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{nope}}bar",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{nope}}bar");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroNotFoundError);
    expect(errors[0].name).toBe("MacroNotFoundError");
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
  });

  it("handles compilation errors", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{syntax}}bar",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{syntax}}bar");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroCompilationError);
    expect(errors[0].name).toBe("MacroCompilationError");
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
  });

  it("handles execution errors", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{throw}}bar",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{throw}}bar");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroExecutionError);
    expect(errors[0].name).toBe("MacroExecutionError");
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
  });

  it("handles undefined variables in macros", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{ undefined() }}bar",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{ undefined() }}bar");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroExecutionError);
    expect(errors[0].name).toBe("MacroExecutionError");
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
  });

  it("handles multiple errors in one document", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{nope(1)}}bar{{throw(2)}}baz{{syntax(3)}}",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{nope(1)}}bar{{throw(2)}}baz{{syntax(3)}}");
    expect(errors).toHaveLength(3);
    expect(errors[0]).toBeInstanceOf(MacroNotFoundError);
    expect(errors[1]).toBeInstanceOf(MacroExecutionError);
    expect(errors[2]).toBeInstanceOf(MacroCompilationError);
  });

  it("handles success plus errors in one document", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      'foo{{echo("!")}} bar{{ throw(1,2) }}baz{{echo("?")}}',
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo! bar{{ throw(1,2) }}baz?");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroExecutionError);
  });

  it("macros can include other macros with template()", async () => {
    const input = "foo {{bar}} baz";
    const expected = "foo (included words) baz";
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      input,
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual(expected);
    expect(errors).toEqual([]);
  });

  it("errors in included macros are reported", async () => {
    const templates = new Templates(fixture("macros"));
    const [result, errors] = await render(
      "foo{{includeError}}bar",
      PAGE_ENV,
      renderPrerequisiteFromURL,
      {
        templates,
      }
    );
    expect(result).toEqual("foo{{includeError}}bar");
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(MacroExecutionError);
    expect(errors[0]).toHaveProperty("line");
    expect(errors[0]).toHaveProperty("column");
  });
});
