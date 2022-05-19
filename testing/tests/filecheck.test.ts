// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'checkFile'... Remove this comment to see the full error message
const { checkFile } = require("../../filecheck/checker");

const dirname = __dirname;

const SAMPLES_DIRECTORY = path.join(dirname, "filechecker", "samplefiles-html");

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("checking files", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot SVGs with scripts inside them", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "script.svg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot SVGs with onLoad inside an element", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "onhandler.svg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow(
      / does not appear to be an SVG$/
    );
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot files that are not mentioned in source", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "orphan.png");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow("is not mentioned in");
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot files that are not mentioned in md source", async () => {
    const filePath = path.join(
      path.join(dirname, "filechecker", "samplefiles-md"),
      "orphan.png"
    );
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow("is not mentioned in");
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot files that are completely empty", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "zero.gif");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow("is 0 bytes");
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should spot mismatch between file-type and file extension", async () => {
    const filePath = path.join(SAMPLES_DIRECTORY, "png.jpeg");
    // Sanity check the test itself
    console.assert(fs.existsSync(filePath), `${filePath} does not exist`);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
    await expect(checkFile(filePath)).rejects.toThrow(
      "is type 'image/png' but named extension is '.jpeg'"
    );
  });
});
