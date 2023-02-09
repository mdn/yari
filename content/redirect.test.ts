import * as Redirect from "./redirect.js";

describe("short cuts", () => {
  it("simple chain", () => {
    const r = Redirect.testing.shortCuts([
      ["/en-US/docs/A", "/en-US/docs/B"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
    expect(r).toEqual([
      ["/en-US/docs/A", "/en-US/docs/C"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
  });
  it("a = a", () => {
    const r = Redirect.testing.shortCuts([
      ["/en-US/docs/A", "/en-US/docs/A"],
      ["/en-US/docs/b", "/en-US/docs/B"],
    ]);
    expect(r).toEqual([]);
  });
  it("simple cycle", () => {
    const r = Redirect.testing.shortCuts([
      ["/en-US/docs/A", "/en-US/docs/B"],
      ["/en-US/docs/B", "/en-US/docs/A"],
    ]);
    expect(r).toEqual([]);
  });
  it("hashes", () => {
    const r = Redirect.testing.shortCuts([
      ["/en-US/docs/A", "/en-US/docs/B#Foo"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
    expect(r).toEqual([
      ["/en-US/docs/A", "/en-US/docs/C#Foo"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
  });
});

describe("decode", () => {
  it("decode internal", () => {
    const r = Redirect.testing.decodePairs([
      ["/en-US/docs/%40/%20/", "/en-US/docs/%3Cfoo%3E"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
    expect(r).toEqual([
      ["/en-US/docs/@/ /", "/en-US/docs/<foo>"],
      ["/en-US/docs/B", "/en-US/docs/C"],
    ]);
  });
  it("decode internal", () => {
    const r = Redirect.testing.decodePairs([
      [
        "/en-US/docs/some",
        "https://foo%40bar.com:foobar@mdn/%20%3A/%F0%9F%94%A5",
      ],
    ]);
    expect(r).toEqual([
      ["/en-US/docs/some", "https://foo%40bar.com:foobar@mdn/ %3A/🔥"],
    ]);
  });
});
