import fs from "node:fs";
import path from "node:path";

import * as Document from "./document.js";

describe("Document.findAll()", () => {
  it("should always return files that exist", async () => {
    const filePaths = [...(await Document.findAll()).iterPaths()];
    expect(filePaths.every((value) => fs.existsSync(value))).toBeTruthy();
  });

  it("all files should be either index.html or index.md", async () => {
    const filePaths = [...(await Document.findAll()).iterPaths()];
    expect(
      filePaths.every(
        (value) => value.endsWith("index.html") || value.endsWith("index.md")
      )
    ).toBeTruthy();
  });

  it("searching by specific file", async () => {
    const filePaths = [...(await Document.findAll()).iterPaths()];
    const randomFile = filePaths[Math.floor(Math.random() * filePaths.length)];
    const specificFilePaths = [
      ...(await Document.findAll({ files: new Set([randomFile]) })).iterPaths(),
    ];
    expect(specificFilePaths).toHaveLength(1);
    expect(specificFilePaths[0]).toBe(randomFile);
  });

  it("searching by specific locales", async () => {
    const specificFilePaths = [
      ...(
        await Document.findAll({ locales: new Map([["fr", true]]) })
      ).iterPaths(),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}fr${path.sep}`)
      )
    ).toBeTruthy();
  });

  it("searching by specific folders", async () => {
    const specificFilePaths = [
      ...(await Document.findAll({ folderSearch: "/foo/" })).iterPaths(),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}foo${path.sep}`)
      )
    ).toBeTruthy();
  });
});
