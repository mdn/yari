// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Document'.
const Document = require("./document");

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe("Document.findAll()", () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("should always return files that exist", () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
    const filePaths = [...Document.findAll().iter({ pathOnly: true })];
    expect(filePaths.every((value) => fs.existsSync(value))).toBeTruthy();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("all files should be either index.html or index.md", () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
    const filePaths = [...Document.findAll().iter({ pathOnly: true })];
    expect(
      filePaths.every(
        (value) => value.endsWith("index.html") || value.endsWith("index.md")
      )
    ).toBeTruthy();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("searching by specific file", () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
    const filePaths = [...Document.findAll().iter({ pathOnly: true })];
    const randomFile = filePaths[Math.floor(Math.random() * filePaths.length)];
    const specificFilePaths = [
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
      ...Document.findAll({ files: new Set([randomFile]) }).iter({
        pathOnly: true,
      }),
    ];
    expect(specificFilePaths.length).toBe(1);
    expect(specificFilePaths[0]).toBe(randomFile);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("searching by specific locales", () => {
    const specificFilePaths = [
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
      ...Document.findAll({ locales: new Map([["fr", true]]) }).iter({
        pathOnly: true,
      }),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}fr${path.sep}`)
      )
    ).toBeTruthy();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it("searching by specific folders", () => {
    const specificFilePaths = [
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'findAll' does not exist on type '{ new (... Remove this comment to see the full error message
      ...Document.findAll({ folderSearch: "/foo/" }).iter({
        pathOnly: true,
      }),
    ];
    expect(
      specificFilePaths.every((filePath) =>
        filePath.includes(`${path.sep}foo${path.sep}`)
      )
    ).toBeTruthy();
  });
});
