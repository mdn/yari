import { jest } from "@jest/globals";
import { assert, itMacro, describeMacro, beforeEachMacro } from "./utils.js";

describeMacro("LiveSampleURL", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.info.hasPage = jest.fn(() => true);
  });
  itMacro("Production settings", function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnplay.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/p";
    return assert.eventually.equal(
      macro.call("Example"),
      "https://live.mdnplay.dev/en-US/docs/Web/HTML/Element/p/runner.html?id=Example"
    );
  });
  itMacro("Override page URL", function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnplay.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.env.url =
      "/en-US/docs/Learn/HTML/Forms/How_to_build_custom_form_widgets";
    return assert.eventually.equal(
      macro.call(
        "No_JS",
        "/en-US/docs/HTML/Forms/How_to_build_custom_form_widgets/Example_2"
      ),
      "https://mdn.mozillademos.org/en-US/docs/HTML/Forms/How_to_build_custom_form_widgets/Example_2/_sample_.No_JS.html?id=No_JS&amp;url=%2Fen-US%2Fdocs%2FHTML%2FForms%2FHow_to_build_custom_form_widgets%2FExample_2"
    );
  });
  itMacro("Override with nonexistent page URL", async (macro) => {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnplay.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.info.hasPage = jest.fn(() => false);
    macro.ctx.info.getDescription = jest.fn((url: string) => url.toLowerCase());
    macro.ctx.env.url = "/en-US/docs/Learn/HTML";
    await expect(
      macro.call("No_JS", "/en-US/docs/does/not/exist")
    ).rejects.toThrow(
      "/en-us/docs/learn/html references /en-us/docs/does/not/exist, which does not exist"
    );
  });
  itMacro("Staging settings", function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnyalp.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.env.url = "/en-US/docs/Web/CSS/background-color";
    return assert.eventually.equal(
      macro.call("Examples"),
      "https://live.mdnyalp.dev/en-US/docs/Web/CSS/background-color/runner.html?id=Examples"
    );
  });
  itMacro("Development default settings", function (macro) {
    macro.ctx.env.live_samples = { base_url: "http://localhost:8000" };
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/p";
    return assert.eventually.equal(
      macro.call("Example"),
      "http://localhost:8000/en-US/docs/Web/HTML/Element/p/runner.html?id=Example"
    );
  });
  itMacro("Unicode ID", function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnplay.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.env.url = "/zh-CN/docs/Web/CSS/flex-direction";
    return assert.eventually.equal(
      macro.call("例子"),
      "https://live.mdnplay.dev/zh-CN/docs/Web/CSS/flex-direction/runner.html?id=%E4%BE%8B%E5%AD%90"
    );
  });
  itMacro("Development demo settings", function (macro) {
    macro.ctx.env.live_samples = { base_url: "http://demos:8000" };
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/p";
    return assert.eventually.equal(
      macro.call("Example"),
      "http://demos:8000/en-US/docs/Web/HTML/Element/p/runner.html?id=Example"
    );
  });
});
