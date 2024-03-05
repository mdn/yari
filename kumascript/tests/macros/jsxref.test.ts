import { jest } from "@jest/globals";

import { assert, itMacro, describeMacro } from "./utils.js";

const js_ref_slug = "Web/JavaScript/Reference/";
const js_ref_url = `/en-US/docs/${js_ref_slug}`;

function getPathname(url) {
  return new URL(url, "https://example.com").pathname.replace(/\/$/, "");
}

describeMacro("jsxref", function () {
  itMacro("One argument (simple global object)", function (macro) {
    // Suggested in macro docstring, used on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
    const name = "Date";
    const partial_slug = "Date";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${glob_url}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      if (url === glob_url) {
        return {
          url: glob_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === ref_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(macro.call(name), expected);
  });

  itMacro("One argument (method by title)", function (macro) {
    // Used on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse
    const name = "Array.prototype.join()";
    const partial_slug = "Array/join";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${glob_url}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      if (url === glob_url) {
        return {
          url: glob_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === ref_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(macro.call(name), expected);
  });

  itMacro("Two arguments (method by slug, display name)", function (macro) {
    // Used on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
    // {{jsxref("Statements/function", "function statement")}}
    const name = "function statement";
    const partial_slug = "Statements/function";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${glob_url}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      if (url === glob_url) {
        return {
          url: glob_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === ref_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(macro.call(partial_slug, name), expected);
  });

  itMacro("Two arguments (non-global by slug, name)", function (macro) {
    // Used on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators
    // {{jsxref("Operators/yield", "yield")}}
    const name = "yield";
    const partial_slug = "Operators/yield";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${ref_url}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      if (url === ref_url) {
        return {
          url: ref_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === glob_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(macro.call(partial_slug, name), expected);
  });

  itMacro("Three arguments (slug, name, #anchor)", function (macro) {
    // Used on:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
    // {{jsxref("Statements/for...in", "array iteration and for...in", "#Array_iteration_and_for...in")}}
    const name = "array iteration and for...in";
    const partial_slug = "Statements/for...in";
    const anchor = "#Array_iteration_and_for...in";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${glob_url}${anchor}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      url = getPathname(url);
      if (url === glob_url) {
        return {
          url: glob_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === ref_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(
      macro.call(partial_slug, name, anchor),
      expected
    );
  });

  itMacro(
    "Three arguments (slug, name, anchor without hash) [ru]",
    function (macro) {
      // When the # is omitted in the anchor, it is automatically added
      // Used on:
      // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Array/prototype
      // {{jsxref("Global_Objects/Array", "Array", "массива")}}
      const name = "Array";
      const partial_slug = "Global_Objects/Array";
      const anchor = "массива";
      const ru_js_ref_url = `/ru/docs/${js_ref_slug}`;
      const default_js_ref_url = `/en-US/docs/${js_ref_slug}`;
      const ref_url = ru_js_ref_url + partial_slug;
      const default_ref_url = default_js_ref_url + partial_slug;
      const glob_url = `${ru_js_ref_url}Global_Objects/${partial_slug}`;
      const default_glob_url = `${default_js_ref_url}Global_Objects/${partial_slug}`;
      const expected =
        `<a href="${glob_url}#` +
        `%D0%BC%D0%B0%D1%81%D1%81%D0%B8%D0%B2%D0%B0` +
        `">` +
        `<code>${name}</code></a>`;

      macro.ctx.env.locale = "ru";

      macro.ctx.info.getPageByURL = jest.fn((url) => {
        url = getPathname(url);
        if (url === glob_url) {
          return {
            url: glob_url,
            slug: js_ref_slug + partial_slug,
          };
        } else if (url === default_glob_url) {
          return {
            url: default_glob_url,
            slug: js_ref_slug + partial_slug,
          };
        } else if (url === default_ref_url || url === ref_url) {
          return {};
        }
      });
      macro.ctx.info.getPathname = getPathname;

      return assert.eventually.equal(
        macro.call(partial_slug, name, anchor),
        expected
      );
    }
  );

  itMacro(
    "Four arguments (slug, name, empty anchor, omit code wrap)",
    function (macro) {
      // Used on:
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
      // {{jsxref("Operators/function", "function expressions", "", 1)}}
      const name = "function expressions";
      const partial_slug = "Operators/function";
      const ref_url = js_ref_url + partial_slug;
      const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
      const expected = `<a href="${ref_url}">${name}</a>`;

      macro.ctx.info.getPageByURL = jest.fn((url) => {
        if (url === ref_url) {
          return {
            url: ref_url,
            slug: js_ref_slug + partial_slug,
          };
        } else if (url === glob_url) {
          return {};
        }
      });
      macro.ctx.info.getPathname = getPathname;

      return assert.eventually.equal(
        macro.call(partial_slug, name, "", 1),
        expected
      );
    }
  );

  itMacro("Quotes in summary are escaped", function (macro) {
    // Double-quotes are replaced with &quot;. Used on:
    // https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/38
    // {{jsxref("Function/name", "name")}}
    const name = "name";
    const partial_slug = "Function/name";
    const ref_url = js_ref_url + partial_slug;
    const glob_url = `${js_ref_url}Global_Objects/${partial_slug}`;
    const expected = `<a href="${glob_url}"><code>${name}</code></a>`;

    macro.ctx.info.getPageByURL = jest.fn((url) => {
      if (url === glob_url) {
        return {
          url: glob_url,
          slug: js_ref_slug + partial_slug,
        };
      } else if (url === ref_url) {
        return {};
      }
    });
    macro.ctx.info.getPathname = getPathname;

    return assert.eventually.equal(macro.call(partial_slug, name), expected);
  });
});
