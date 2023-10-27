import {
  createRegExpFromExtensions,
  ANY_ATTACHMENT_REGEXP,
  BINARY_ATTACHMENT_REGEXP,
} from "./index.js";

describe("createRegExpFromExt", () => {
  const regexp = createRegExpFromExtensions("foo");

  it("accepts the extension", () => {
    expect(regexp.test("test.foo")).toEqual(true);
  });

  it("accepts uppercase", () => {
    expect(regexp.test("test.FOO")).toEqual(true);
  });

  it("rejects intermediate extensions", () => {
    expect(regexp.test("test.foo.bar")).toEqual(false);
  });

  it("rejects other extensions", () => {
    expect(regexp.test("test.bar")).toEqual(false);
  });

  it("rejects extensions starting with it", () => {
    expect(regexp.test("test.foob")).toEqual(false);
  });

  it("rejects extensions ending with it", () => {
    expect(regexp.test("test.afoo")).toEqual(false);
  });
});

describe("ANY_ATTACHMENT_REGEXP", () => {
  const regexp = ANY_ATTACHMENT_REGEXP;
  it("accepts audio files", () => {
    expect(regexp.test("audio.mp3")).toEqual(true);
  });

  it("accepts video files", () => {
    expect(regexp.test("video.mp4")).toEqual(true);
  });

  it("accepts font files", () => {
    expect(regexp.test("diagram.svg")).toEqual(true);
  });

  ["index.html", "index.json", "index.md", "contributors.txt"].forEach(
    (filename) =>
      it(`rejects ${filename}`, () => {
        expect(regexp.test(filename)).toEqual(false);
      })
  );
});

describe("BINARY_ATTACHMENT_REGEXP", () => {
  const regexp = BINARY_ATTACHMENT_REGEXP;
  it("rejects svg files", () => {
    expect(regexp.test("diagram.svg")).toEqual(false);
  });
});
