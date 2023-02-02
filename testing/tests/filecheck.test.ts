import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { checkFile, runChecker } from "../../filecheck/checker.js";

const SAMPLES_DIRECTORY = new URL(
  "filechecker/samplefiles-html/",
  import.meta.url
);

function getFilePath(...paths) {
  const filePath = fileURLToPath(new URL(...paths, SAMPLES_DIRECTORY));
  // Sanity check the test itself
  console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
  return filePath;
}

describe("checking files", () => {
  it("should spot SVGs with scripts inside them", async () => {
    const filePath = getFilePath("samplefiles-html", "script.svg");
    await expect(checkBinaryFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });

  it("should spot SVGs with onLoad inside an element", async () => {
    const filePath = getFilePath("samplefiles-html", "onhandler.svg");
    await expect(checkBinaryFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });

  it("should spot files that are not mentioned in source", async () => {
    const filePath = getFilePath("samplefiles-html", "orphan.png");
    await expect(checkBinaryFile(filePath)).rejects.toThrow(
      "is not mentioned in"
    );
  });

  it("should spot files that are not mentioned in md source", async () => {
    const filePath = getFilePath("samplefiles-md", "orphan.png");
    await expect(checkBinaryFile(filePath)).rejects.toThrow(
      "is not mentioned in"
    );
  });

  it("should spot files that are completely empty", async () => {
    const filePath = getFilePath("samplefiles-html", "zero.gif");
    await expect(checkBinaryFile(filePath)).rejects.toThrow("is 0 bytes");
  });

  it("should spot mismatch between file-type and file extension", async () => {
    const filePath = getFilePath("samplefiles-html", "png.jpeg");
    await expect(checkBinaryFile(filePath)).rejects.toThrow(
      "of type 'image/png' should have extension 'png', but has extension '.jpeg'"
    );
  });

  it("should spot files with uppercase file names", async () => {
    const filePath = getFilePath("samplefiles-upperCase", "index.md");
    await expect(runChecker([filePath], {})).rejects.toThrow(
      "Error: Invalid path: samplefiles-upperCase/index.md. All characters must be lowercase."
    );
  });

  it("should spot files with parenthese in file names", async () => {
    const filePath = getFilePath("samplefiles-paren(theses)", "index.md");
    await expect(runChecker([filePath], {})).rejects.toThrow(
      "Error: Invalid path: samplefiles-paren(theses)/index.md. File path must not include characters: '(', ')'"
    );
  });

  it("should spot files with whitespaces in file names", async () => {
    const filePath = getFilePath("_Group Data.json");
    await expect(runChecker([filePath], {})).rejects.toThrow(
      "Error: Invalid path: en-us/_Group Data.json. File path must not include whitespaces."
    );
  });

  it("should spot unsupported extension", async () => {
    const filePath = getFilePath("animation.flv");
    await expect(runChecker([filePath], {})).rejects.toThrow(
      /Error: Invalid file: en-us\/animation.flv. The file extension is not supported\..*/
    );
  });
});
