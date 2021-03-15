const fs = require("fs");
const path = require("path");

const { checkFile } = require("../../filecheck/checker");

const SAMPLES_DIRECTORY = path.join(__dirname, "samplefiles");

describe("checking files", () => {
  it("should spot SVGs with scripts inside them", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "script.svg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      "contains a <script> tag"
    );
  });
  it("should spot SVGs with onLoad inside an element", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "onhandler.svg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      "<path> contains an unsafe attribute: 'onload'"
    );
  });

  it("should spot files that are not mentioned in source", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "orphan.png");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow("is not mentioned in");
  });

  it("should spot files that are completely empty", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "zero.gif");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow("is 0 bytes");
  });

  it("should spot mismatch between file-type and file extension", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "png.jpeg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      "is type 'image/png' but named extension is '.jpeg'"
    );
  });
});
