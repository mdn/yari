import fs from "node:fs";
import path from "node:path";

import * as Document from "./document";

describe("Document.findAll()", () => {
  it("should always return files that exist", () => {
    const filePaths = [...Document.findAll().iterPaths()];
    expect(filePaths.every((value) => fs.existsSync(value))).toBeTruthy();
  });

  it("all files should be either index.html or index.md", () => {
    const filePaths = [...Document.findAll().iterPaths()];
    expect(
      filePaths.every(
        (value) => value.endsWith("index.html") || value.endsWith("index.md")
      )
    ).toBeTruthy();
  });

  it("searching by specific file", () => {
    const filePaths = [...Document.findAll().iterPaths()];
    const randomFile = filePaths[Math.floor(Math.random() * filePaths.length)];
    const specificFilePaths = [
      ...Document.findAll({ files: new Set([randomFile]) }).iterPaths(),
    ];
    expect(specificFilePaths).toHaveLength(1);
    expect(specificFilePaths[0]).toBe(randomFile);
  });

  it("searching by specific locales", () => {
    const specificFilePaths = [
      ...Document.findAll({ locales: new Map([["fr", true]]) }).iterPaths(),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}fr${path.sep}`)
      )
    ).toBeTruthy();
  });

  it("searching by specific folders", () => {
    const specificFilePaths = [
      ...Document.findAll({ folderSearch: "/foo/" }).iterPaths(),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}foo${path.sep}`)
      )
    ).toBeTruthy();
  });
});
