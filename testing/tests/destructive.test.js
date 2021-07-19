/**
 * These jest tests are considered destructive because they make changes
 * to the files created by `yarn build`.
 *
 * What these tests do is they copy the whole (testing) content directory
 * and the (client) build directory all into a temp directory. Now we
 * can trigger `yarn build` and be OK with it messing
 * with any of the files there.
 */

const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

const tempy = require("tempy");

const CONTENT_DIR = path.resolve(path.join("content"));
const BUILD_DIR = path.resolve(path.join("..", "client", "build"));

function* walker(root) {
  const files = fs.readdirSync(root);
  for (const name of files) {
    const filepath = path.join(root, name);
    const stat = fs.statSync(filepath);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      yield* walker(filepath);
    } else {
      yield [filepath, stat];
    }
  }
}

describe("fixing flaws", () => {
  const pattern = path.join("web", "fixable_flaws");
  const baseDir = path.resolve("..");

  let tempdir;
  let tempBuildDir;
  let tempContentDir;
  const filesBefore = new Map();

  function populateFilesBefore(dir) {
    for (const [filepath, stat] of walker(dir)) {
      filesBefore.set(filepath, stat.mtimeMs);
    }
  }
  function getChangedFiles(dir) {
    const changed = [];
    for (const [filepath, stat] of walker(dir)) {
      if (!filesBefore.has(filepath)) {
        changed.push(filepath);
      } else if (stat.mtimeMs !== filesBefore.get(filepath)) {
        changed.push(filepath);
      }
    }
    return changed;
  }

  beforeEach(() => {
    // Copy the whole content directory
    tempdir = tempy.directory();
    tempContentDir = path.join(tempdir, "content");
    fse.copySync(CONTENT_DIR, tempContentDir);
    populateFilesBefore(tempContentDir);
    tempBuildDir = path.join(tempdir, "build");
    fse.copySync(BUILD_DIR, tempBuildDir);
  });

  afterEach(() => {
    // Note! This isn't strictly needed since the OS will take care of
    // deleting things from the temp directory natively and we strictly
    // don't need to stick around to wait for this.
    // See https://github.com/sindresorhus/tempy#why-doesnt-it-have-a-cleanup-method
    // But when doing local dev it's nice to not go crazy on your laptop's
    // tmp directory if you run this over and over.
    fse.removeSync(tempdir);
  });

  it("can be run in dry-run mode", () => {
    const stdout = execSync("yarn build", {
      cwd: baseDir,
      windowsHide: true,
      env: Object.assign(
        {
          CONTENT_ROOT: path.join(tempContentDir, "files"),
          BUILD_OUT_ROOT: tempBuildDir,
          BUILD_FIX_FLAWS: "true",
          BUILD_FIX_FLAWS_DRY_RUN: "true",
          BUILD_FOLDERSEARCH: pattern,
        },
        process.env
      ),
    }).toString();

    const regexPattern = /Would modify "(.*)"./g;
    const dryRunNotices = stdout
      .split("\n")
      .filter((line) => regexPattern.test(line));
    expect(dryRunNotices.length).toBe(4);
    expect(dryRunNotices[0]).toContain(path.join(pattern, "bad_pre_tags"));
    expect(dryRunNotices[1]).toContain(path.join(pattern, "deprecated_macros"));
    expect(dryRunNotices[2]).toContain(path.join(pattern, "images"));
    expect(dryRunNotices[3]).toContain(pattern);
    const dryrunFiles = getChangedFiles(tempContentDir);
    expect(dryrunFiles.length).toBe(0);
  });

  it("can actually change the files", () => {
    const stdout = execSync("yarn build", {
      cwd: baseDir,
      windowsHide: true,
      env: Object.assign(
        {
          CONTENT_ROOT: path.join(tempContentDir, "files"),
          BUILD_OUT_ROOT: tempBuildDir,
          BUILD_FIX_FLAWS: "true",
          BUILD_FIX_FLAWS_DRY_RUN: "false",
          BUILD_FOLDERSEARCH: pattern,
        },
        process.env
      ),
    }).toString();
    expect(stdout).toContain(pattern);

    const files = getChangedFiles(tempContentDir);
    expect(files.length).toBe(4);
    const imagesFile = files.find((f) =>
      f.includes(path.join(pattern, "images"))
    );
    const newRawHtmlImages = fs.readFileSync(imagesFile, "utf-8");
    expect(newRawHtmlImages).toContain('src="fixable.png"');

    const badPreTagFile = files.find((f) =>
      f.includes(path.join(pattern, "bad_pre_tags"))
    );
    const newRawHtmlPreWithHTML = fs.readFileSync(badPreTagFile, "utf-8");
    expect(newRawHtmlPreWithHTML).not.toContain("<code>");

    const deprecatedMacrosFile = files.find((f) =>
      f.includes(path.join(pattern, "deprecated_macros"))
    );
    const newRawHtmlDeprecatedMacros = fs.readFileSync(
      deprecatedMacrosFile,
      "utf-8"
    );
    expect(newRawHtmlDeprecatedMacros).not.toContain("{{");

    const regularFile = files.find(
      (f) =>
        f !== imagesFile && f !== badPreTagFile && f !== deprecatedMacrosFile
    );
    const newRawHtml = fs.readFileSync(regularFile, "utf-8");
    expect(newRawHtml).toContain("{{CSSxRef('number')}}");
    expect(newRawHtml).toContain('{{htmlattrxref("href", "a")}}');
    // Broken links that get fixed.
    expect(newRawHtml).toContain('href="/en-US/docs/Web/CSS/number"');
    expect(newRawHtml).toContain("href='/en-US/docs/Web/CSS/number'");
    expect(newRawHtml).toContain('href="/en-US/docs/Glossary/Bézier_curve"');
    expect(newRawHtml).toContain('href="/en-US/docs/Web/Foo"');
  });
});
