import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { checkFile, runChecker } from "../../filecheck/checker.js";

const SAMPLES_DIRECTORY = new URL(
  "filechecker/samplefiles-html/",
  import.meta.url
);

describe("checking files", () => {
  it("should spot SVGs with scripts inside them", async () => {
    const filePath = fileURLToPath(new URL("./script.svg", SAMPLES_DIRECTORY));
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });
  it("should spot SVGs with onLoad inside an element", async () => {
    const filePath = fileURLToPath(
      new URL("./onhandler.svg", SAMPLES_DIRECTORY)
    );
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });

  it("should spot files that are not mentioned in source", async () => {
    const filePath = fileURLToPath(new URL("./orphan.png", SAMPLES_DIRECTORY));
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow("is not mentioned in");
  });

  it("should spot files that are not mentioned in md source", async () => {
    const filePath = fileURLToPath(
      new URL("./filechecker/samplefiles-md/orphan.png", import.meta.url)
    );
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow("is not mentioned in");
  });

  it("should spot files that are completely empty", async () => {
    const filePath = fileURLToPath(new URL("./zero.gif", SAMPLES_DIRECTORY));
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow("is 0 bytes");
  });

  it("should spot mismatch between file-type and file extension", async () => {
    const filePath = fileURLToPath(new URL("./png.jpeg", SAMPLES_DIRECTORY));
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      "of type 'image/png' should have extension 'png', but has extension '.jpeg'"
    );
  });

  it("should spot files with uppercase file names", async () => {
    const filePath = path.join(
      path.join(dirname, "filechecker", "samplefiles-upperCase"),
      "index.md"
    );
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(runChecker([filePath], {})).rejects.toThrow(
      "Error: Invalid path: samplefiles-upperCase/index.md. All characters must be lowercase."
    );
  });

  it("should spot files with parenthese in file names", async () => {
    const filePath = path.join(
      path.join(dirname, "filechecker", "samplefiles-paren(theses)"),
      "index.md"
    );
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(runChecker([filePath], {})).rejects.toThrow(
      "Error: Invalid path: samplefiles-paren(theses)/index.md. File path must not include characters: '(', ')'"
    );
  });
});
