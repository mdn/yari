/**
 * @prettier
 */
describe("config.js", () => {
  beforeEach(() => {
    // We want to reload the config.js module for each test
    jest.resetModules();
  });

  it("default configuration", () => {
    const config = require("../src/config.js");

    expect(config.documentURL).toBe("https://developer.mozilla.org");
    expect(config.interactiveExamplesURL).toBe(
      "https://interactive-examples.mdn.mozilla.net"
    );
    expect(config.liveSamplesURL).toBe("https://mdn.mozillademos.org");
    expect(config.cacheMegabytes).toBe(200);
  });

  it("configured with environment variables", () => {
    process.env["DOCUMENT_URL"] = "B";
    process.env["INTERACTIVE_EXAMPLES_URL"] = "C";
    process.env["LIVE_SAMPLES_URL"] = "D";
    process.env["KUMASCRIPT_CACHE_MEGABYTES"] = "100";

    const config = require("../src/config.js");

    expect(config.documentURL).toBe("B");
    expect(config.interactiveExamplesURL).toBe("C");
    expect(config.liveSamplesURL).toBe("D");
    expect(config.cacheMegabytes).toBe(100);
  });
});
