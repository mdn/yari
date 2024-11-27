import { jest } from "@jest/globals";
import { assert, itMacro, describeMacro, beforeEachMacro } from "./utils.js";

describeMacro("EmbedLiveSample", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://live.mdnplay.dev",
      legacy_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.info.hasPage = jest.fn(() => true);
  });
  itMacro("One argument: ID", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Quotations"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Quotations sample"' +
        ' id="frame_quotations"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/HTML/Element/figure" data-live-id="quotations"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("One argument: ID with HTML entities (bug?)", function (macro) {
    // Kuma doesn't serve the sample for the generated URL
    macro.ctx.env.url = "/en-US/docs/Web/SVG/Element/switch";
    return assert.eventually.equal(
      macro.call("SVG_&lt;switch&gt;_example"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="SVG &amp;lt;switch&amp;gt; example sample"' +
        ' id="frame_svg_ltswitchgt_example"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/SVG/Element/switch" data-live-id="svg_ltswitchgt_example"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("One argument: percent-encoded ID", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/SVG/Element/switch";
    return assert.eventually.equal(
      macro.call("SVG_%3Cswitch%3E_example"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="SVG %3Cswitch%3E example sample"' +
        ' id="frame_svg_switch_example"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/SVG/Element/switch" data-live-id="svg_switch_example"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("One argument: ID with percent-encoded page URL", function (macro) {
    macro.ctx.env.url =
      "/fr/docs/Web/CSS/Utilisation_de_d%C3%A9grad%C3%A9s_CSS";
    return assert.eventually.equal(
      macro.call("Dégradés_linéaires_simples"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Dégradés linéaires simples sample"' +
        ' id="frame_dégradés_linéaires_simples"' +
        ' src="about:blank" data-live-path="/fr/docs/Web/CSS/Utilisation_de_d%C3%A9grad%C3%A9s_CSS" data-live-id="dégradés_linéaires_simples"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("One argument: XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call('"><script>alert("XSS");</script>'),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt; sample"' +
        ' id="frame_scriptalertxssscript"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/HTML/Element/figure" data-live-id="scriptalertxssscript"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Two arguments: ID, width", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/border-top-width";
    return assert.eventually.equal(
      macro.call("Example", "100%"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Example sample"' +
        ' id="frame_example"' +
        ' width="100%"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/CSS/border-top-width" data-live-id="example"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Two arguments: ID, XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/border-top-width";
    return assert.eventually.equal(
      macro.call("Example", '"><script>alert("XSS");</script>'),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Example sample"' +
        ' id="frame_example"' +
        ' width="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt;"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/CSS/border-top-width" data-live-id="example"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Three arguments: ID, width, height", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Images", "100%", 250),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Images sample"' +
        ' id="frame_images"' +
        ' width="100%" height="250"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/HTML/Element/figure" data-live-id="images"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Three arguments: unicode ID, width, height", function (macro) {
    macro.ctx.env.url =
      "/zh-CN/docs/Web/CSS/CSS_Animations/Using_CSS_animations";
    return assert.eventually.equal(
      macro.call("增加关键帧", "100%", "250"),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="增加关键帧 sample"' +
        ' id="frame_增加关键帧"' +
        ' width="100%" height="250"' +
        ' src="about:blank" data-live-path="/zh-CN/docs/Web/CSS/CSS_Animations/Using_CSS_animations" data-live-id="增加关键帧"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Three arguments: url-encoded ID, width, height", function (macro) {
    macro.ctx.env.url = "/zh-CN/docs/Web/API/Canvas_API/Tutorial/Basic_usage";
    return assert.eventually.equal(
      macro.call(
        "%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%9D%BF%E9%AA%A8%E6%9E%B6",
        160,
        160
      ),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%9D%BF%E9%AA%A8%E6%9E%B6 sample"' +
        ' id="frame_一个模板骨架"' +
        ' width="160" height="160"' +
        ' src="about:blank" data-live-path="/zh-CN/docs/Web/API/Canvas_API/Tutorial/Basic_usage" data-live-id="一个模板骨架"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  itMacro("Three arguments: ID, width, XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Images", "100%", '"><script>alert("XSS");</script>'),
      '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
        ' title="Images sample"' +
        ' id="frame_images"' +
        ' width="100%" height="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt;"' +
        ' src="about:blank" data-live-path="/en-US/docs/Web/HTML/Element/figure" data-live-id="images"' +
        ' sandbox="allow-same-origin allow-scripts">' +
        "</iframe></div>"
    );
  });
  const same_slug_iframe =
    '<div class="code-example"><div class="example-header"></div><iframe class="sample-code-frame"' +
    ' title="Examples sample"' +
    ' id="frame_examples"' +
    ' width="700px" height="700px"' +
    ' src="about:blank" data-live-path="/en-US/docs/Web/CSS/flex-wrap" data-live-id="examples"' +
    ' sandbox="allow-same-origin allow-scripts">' +
    "</iframe></div>";
  itMacro("Three arguments: ID, width, height (same slug)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/flex-wrap";
    return assert.eventually.equal(
      macro.call("Examples", "700px", "700px"),
      same_slug_iframe
    );
  });
});
