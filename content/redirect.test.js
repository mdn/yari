const Redirect = require("./redirect");

describe("short cuts", () => {
  it("simple chain", () => {
    const r = Redirect.testing.shortCuts([
      ["A", "B"],
      ["B", "C"],
    ]);
    expect(r).toEqual([
      ["A", "C"],
      ["B", "C"],
    ]);
  });
  it("a = a", () => {
    const r = Redirect.testing.shortCuts([["A", "A"]]);
    expect(r).toEqual([]);
  });
  it("simple cycle", () => {
    const r = Redirect.testing.shortCuts([
      ["A", "B"],
      ["B", "A"],
    ]);
    expect(r).toEqual([]);
  });
});

describe("decode", () => {
  it("decode internal", () => {
    const r = Redirect.testing.decodePairs([
      ["/%40/%20/", "/%3Cfoo%3E"],
      ["B", "C"],
    ]);
    expect(r).toEqual([
      ["/@/ /", "/<foo>"],
      ["B", "C"],
    ]);
  });
  it("decode internal", () => {
    const r = Redirect.testing.decodePairs([
      ["/some", "https://foo%40bar.com:foobar@mdn/%20%3A/%F0%9F%94%A5"],
    ]);
    expect(r).toEqual([["/some", "https://foo%40bar.com:foobar@mdn/ %3A/🔥"]]);
  });
});
