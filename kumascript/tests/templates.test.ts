/**
 * @prettier
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Templates'... Remove this comment to see the full error message
const Templates = require("../src/templates.js");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

const dirname = __dirname;

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Templates class", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("has the expected methods", () => {
    expect(typeof Templates).toBe("function");
    expect(Templates.prototype.render).toBeInstanceOf(Function);
    expect(Templates.prototype.getTemplateMap).toBeInstanceOf(Function);
  });

  function dir(name) {
    return path.resolve(dirname, "fixtures", "templates", name);
  }

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws on non-existent dir", () => {
    expect(() => new Templates(dir("no_such_directory"))).toThrow(
      "no such file or directory"
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws on an empty dir", () => {
    expect(() => new Templates(dir("empty_macro_dir"))).toThrow(
      "No macros found"
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("throws on duplicate macros", () => {
    expect(() => new Templates(dir("duplicate_macros"))).toThrow(
      "Duplicate macros"
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("creates a macros map", () => {
    const directory = dir("macros");
    const macros = new Templates(directory);
    expect(macros.getTemplateMap()).toEqual(
      new Map([
        ["test1", path.resolve(directory, "test1.ejs")],
        ["test2", path.resolve(directory, "Test2.ejs")],
        ["async", path.resolve(directory, "async.ejs")],
      ])
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("can render macros", async () => {
    const macros = new Templates(dir("macros"));

    const result1 = await macros.render("test1", {});
    expect(result1).toEqual("1");

    const result2 = await macros.render("test2", { n: 2 });
    expect(result2).toEqual("3");
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("macros can use await", async () => {
    const macros = new Templates(dir("macros"));

    const result = await macros.render("async", {
      async_adder(n) {
        return new Promise((resolve) => {
          setTimeout(() => resolve(n + 1));
        });
      },
    });
    expect(result).toEqual("2\n3");
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("macro arguments can be inherited", async () => {
    const macros = new Templates(dir("macros"));
    const result = await macros.render("test2", Object.create({ n: 2 }));
    expect(result).toEqual("3");
  });

  ["development", "production"].forEach((mode) => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it(`loads files ${
      mode === "production" ? "only once" : "for each call"
    } in ${mode} mode`, async () => {
      // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'NODE_ENV' because it is a read-o... Remove this comment to see the full error message
      process.env.NODE_ENV = mode;
      const EJS = require("ejs");
      /**
       * Without `JSON.stringify(…)`, `\` in the file path would be treated
       * as part of an escape sequence (e.g.:
       * `C:\nodejs\...\kumascript\tests\fixtures\templates\test.ejs`
       * would be interpreted as:
       *
       * ```none
       * C:
       * odejs...kumascript	ests␌ixtures	emplates	est.ejs
       * ```
       */
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'jest'.
      const mockLoader = jest.fn(
        (filename) => `<%= ${JSON.stringify(filename)} -%>`
      );
      EJS.clearCache();
      EJS.fileLoader = mockLoader;
      const directory = dir("macros");
      const macros = new Templates(directory);

      const result1 = await macros.render("test1");
      expect(result1).toBe(path.resolve(directory, "test1.ejs"));
      expect(mockLoader.mock.calls.length).toBe(1);

      const result2 = await macros.render("test2");
      expect(result2).toBe(path.resolve(directory, "Test2.ejs"));
      expect(mockLoader.mock.calls.length).toBe(2);

      // Render the macros again, but don't expect any more loads
      // when we're in production mode.
      await macros.render("test1");
      await macros.render("test2");
      await macros.render("test1");
      await macros.render("test2");
      expect(mockLoader.mock.calls.length).toBe(mode === "production" ? 2 : 6);
    });
  });
});
