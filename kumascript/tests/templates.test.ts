import { fileURLToPath } from "node:url";
import path from "node:path";

import EJS from "ejs";
import { jest } from "@jest/globals";
import Templates from "../src/templates.js";

describe("Templates class", () => {
  it("has the expected methods", () => {
    expect(typeof Templates).toBe("function");
    expect(Templates.prototype.render).toBeInstanceOf(Function);
    expect(Templates.prototype.getTemplateMap).toBeInstanceOf(Function);
  });

  function dir(name) {
    return fileURLToPath(
      new URL(`./fixtures/templates/${name}`, import.meta.url)
    );
  }

  it("throws on non-existent dir", () => {
    expect(() => new Templates(dir("no_such_directory"))).toThrow(
      "no such file or directory"
    );
  });

  it("throws on an empty dir", () => {
    expect(() => new Templates(dir("empty_macro_dir"))).toThrow(
      "No macros found"
    );
  });

  it("throws on duplicate macros", () => {
    expect(() => new Templates(dir("duplicate_macros"))).toThrow(
      "Duplicate macros"
    );
  });

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

  it("can render macros", async () => {
    const macros = new Templates(dir("macros"));

    const result1 = await macros.render("test1", {});
    expect(result1).toEqual("1");

    const result2 = await macros.render("test2", { n: 2 });
    expect(result2).toEqual("3");
  });

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

  it("macro arguments can be inherited", async () => {
    const macros = new Templates(dir("macros"));
    const result = await macros.render("test2", Object.create({ n: 2 }));
    expect(result).toEqual("3");
  });

  [false, true].forEach((doCache) => {
    it(`loads files ${doCache ? "only once" : "for each call"} in ${
      doCache ? "production" : "development"
    } mode`, async () => {
      /**
       * JSON.stringify is used here to handle Windows file paths. Without
       * it, `\` in the file path would be treated as part of an escape
       * sequence.
       */
      const mockLoader = jest.fn(
        (filename) => `<%= ${JSON.stringify(filename)} -%>`
      );
      EJS.clearCache();
      EJS.fileLoader = mockLoader;
      const directory = dir("macros");
      const macros = new Templates(directory);

      const result1 = await macros.render("test1", {
        cache: doCache,
      });
      expect(result1).toBe(path.resolve(directory, "test1.ejs"));
      expect(mockLoader.mock.calls).toHaveLength(1);

      const result2 = await macros.render("test2", {
        cache: doCache,
      });
      expect(result2).toBe(path.resolve(directory, "Test2.ejs"));
      expect(mockLoader.mock.calls).toHaveLength(2);

      // Render the macros again, but don't expect any more loads
      // when we're in production mode.
      await macros.render("test1", { cache: doCache });
      await macros.render("test2", { cache: doCache });
      await macros.render("test1", { cache: doCache });
      await macros.render("test2", { cache: doCache });
      expect(mockLoader.mock.calls).toHaveLength(doCache ? 2 : 6);
    });
  });
});
