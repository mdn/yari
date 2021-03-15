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
    const filePath = path.join(SAMPLES_DIRECTORY, "script.svg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    await expect(checkFile(filePath)).rejects.toThrow(
      "contains a <script> tag"
    );
  });
});
