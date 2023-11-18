import { fileURLToPath } from "node:url";

import { HtmlValidate } from "html-validate";

import Environment from "../../src/environment.js";
import Templates from "../../src/templates.js";
import fs from "node:fs";

// When we were doing mocha testing, we used this.macro to hold this.
// But Jest doesn't use the this object, so we just store the object here.
let macro = null;

export function assert(x) {
  expect(x).toBe(true);
}

assert.equal = (x, y) => {
  expect(x).toEqual(y);
};

assert.eventually = {
  async equal(x, y) {
    expect(await x).toEqual(y);
  },
};

assert.include = (list, element) => {
  expect(list).toContain(element);
};
assert.isTrue = (value) => {
  expect(value).toEqual(true);
};
assert.isFalse = (value) => {
  expect(value).toEqual(false);
};
assert.isAbove = (value, floor) => {
  expect(value).toBeGreaterThan(floor);
};
assert.isArray = (value) => {
  expect(value).toBeInstanceOf(Array);
};
assert.isObject = (value) => {
  expect(value).toBeInstanceOf(Object);
};
assert.isFunction = (value) => {
  expect(value).toBeInstanceOf(Function);
};
assert.property = (value, prop) => {
  expect(value).toHaveProperty(prop);
};
assert.notProperty = (value, prop) => {
  expect(value).not.toHaveProperty(prop);
};
assert.sameMembers = (a1, a2) => {
  expect(new Set(a1)).toEqual(new Set(a2));
};

function createMacroTestObject(macroName) {
  const templates = new Templates(
    fileURLToPath(new URL("../../macros/", import.meta.url))
  );
  const pageContext = {
    locale: "en-US",
    url: "",
  };
  const environment = new Environment(pageContext, templates, null, true);

  return {
    /**
     * Give the test-case writer access to the macro's globals (ctx).
     * For example, "macro.ctx.env.locale" can be manipulated to something
     * other than 'en-US' or "macro.ctx.wiki.getPage" can be mocked
     * using "sinon.stub()" to avoid network calls.
     */
    ctx: environment.prototypeEnvironment,

    /**
     * Use this function to make test calls on the named macro, if
     * applicable.  Its arguments become the arguments to the
     * macro. It returns a promise.
     */
    async call(...args) {
      const rendered = await templates.render(
        macroName,
        environment.getExecutionContext(args)
      );
      return rendered;
    },
  };
}

/**
 * This is the essential function for testing macros. Use it as
 * you would use mocha's "describe", with the exception that the
 * first argument must be the name of the macro being tested.
 *
 * @param {string} macroName
 * @param {function():void} runTests
 */
export function describeMacro(macroName, runTests) {
  describe(`test "${macroName}"`, function () {
    beforeEach(function () {
      macro = createMacroTestObject(macroName);
    });
    runTests();
  });
}

/**
 * Syntactic sugar that avoids thinking about the mocha context "this".
 * Use this function as you would use mocha's "it", with the exception
 * that the callback function ("runTest" in this case) should accept a
 * single argument that is the macro test object.
 *
 * @param {string} title
 * @param {function(Macro):void} runTest
 */
export function itMacro(title, runTest) {
  it(title, function () {
    // Assumes that setup returns a promise (if async) or
    // undefined (if synchronous).
    return runTest(macro);
  });
}

/**
 * Syntactic sugar that avoids thinking about the mocha context "this". Use
 * this function as you would use mocha's "beforeEach", with the exception
 * that the callback function ("setup" in this case) should accept a single
 * argument that is the macro test object.
 *
 * @param {function(Macro):void} setup
 */
export function beforeEachMacro(setup) {
  beforeEach(function () {
    // Assumes that setup returns a promise (if async) or
    // undefined (if synchronous).
    return setup(macro);
  });
}

/**
 * Syntactic sugar that avoids thinking about the mocha context "this". Use
 * this function as you would use mocha's "afterEach", with the exception
 * that the callback function ("teardown" in this case) should accept a single
 * argument that is the macro test object.
 *
 * @param {function(Macro):void} teardown
 */
export function afterEachMacro(teardown) {
  afterEach(function () {
    // Assumes that teardown returns a promise (if async) or
    // undefined (if synchronous).
    return teardown(macro);
  });
}

/**
 * This function parses a JSON file containing pages fixture data.
 * It returns the parsed object, with the "translations" property
 * replaced by a function that returns the translations object.
 */
export function parsePagesFixture(file: URL) {
  return JSON.parse(
    fs.readFileSync(fileURLToPath(file), { encoding: "utf-8" }),
    (key, value) => {
      if (key === "translations") {
        return () => value;
      }
      return value;
    }
  );
}

/**
 * This function validates its input as HTML. By default, it assumes the input
 * is an HTML fragment, wrapping it to make a complete HTML document, but the
 * second argument can be set to false to avoid wrapping. It returns null on
 * success, and, on failure, a string detailing all of the errors.
 *
 * @param {string} html
 * @param {boolean} fragment
 */
let htmlValidator = null; // global cache
export function lintHTML(html) {
  if (!htmlValidator) {
    htmlValidator = new HtmlValidate({
      extends: ["html-validate:recommended"],
      rules: {
        "no-inline-style": "off",
        "svg-focusable": "off",
        "no-trailing-whitespace": "off",
        "attr-quotes": "off",
      },
    });
  }
  const report = htmlValidator.validateStringSync(html);
  if (report.valid) {
    return null;
  }
  let result = "";
  for (const messages of report.results.map((result) => result.messages)) {
    for (const message of messages) {
      result += message.message;
    }
  }
  return result;
}
