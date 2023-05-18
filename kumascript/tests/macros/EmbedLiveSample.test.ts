import { jest } from "@jest/globals";
import { assert, itMacro, describeMacro, beforeEachMacro } from "./utils.js";

describeMacro("EmbedLiveSample", function () {
  beforeEachMacro(function (macro) {
    macro.ctx.env.live_samples = {
      base_url: "https://mdn.mozillademos.org",
    };
    macro.ctx.info.hasPage = jest.fn(() => true);
  });
  itMacro("One argument: ID", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Quotations"),
      '<iframe class="sample-code-frame"' +
        ' title="Quotations sample"' +
        ' id="frame_quotations"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/HTML/Element/figure/_sample_.quotations.html">' +
        "</iframe>"
    );
  });
  itMacro("One argument: ID with HTML entities (bug?)", function (macro) {
    // Kuma doesn't serve the sample for the generated URL
    macro.ctx.env.url = "/en-US/docs/Web/SVG/Element/switch";
    return assert.eventually.equal(
      macro.call("SVG_&lt;switch&gt;_example"),
      '<iframe class="sample-code-frame"' +
        ' title="SVG &amp;lt;switch&amp;gt; example sample"' +
        ' id="frame_svg_ltswitchgt_example"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/SVG/Element/switch/_sample_.svg_ltswitchgt_example.html">' +
        "</iframe>"
    );
  });
  itMacro("One argument: percent-encoded ID", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/SVG/Element/switch";
    return assert.eventually.equal(
      macro.call("SVG_%3Cswitch%3E_example"),
      '<iframe class="sample-code-frame"' +
        ' title="SVG %3Cswitch%3E example sample"' +
        ' id="frame_svg_switch_example"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/SVG/Element/switch/_sample_.svg_switch_example.html">' +
        "</iframe>"
    );
  });
  itMacro("One argument: ID with percent-encoded page URL", function (macro) {
    macro.ctx.env.url =
      "/fr/docs/Web/CSS/Utilisation_de_d%C3%A9grad%C3%A9s_CSS";
    return assert.eventually.equal(
      macro.call("Dégradés_linéaires_simples"),
      '<iframe class="sample-code-frame"' +
        ' title="Dégradés linéaires simples sample"' +
        ' id="frame_dégradés_linéaires_simples"' +
        ' src="https://mdn.mozillademos.org/fr/docs/Web/CSS/Utilisation_de_d%C3%A9grad%C3%A9s_CSS/_sample_.d%C3%A9grad%C3%A9s_lin%C3%A9aires_simples.html">' +
        "</iframe>"
    );
  });
  itMacro("One argument: XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call('"><script>alert("XSS");</script>'),
      '<iframe class="sample-code-frame"' +
        ' title="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt; sample"' +
        ' id="frame_scriptalertxssscript"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/HTML/Element/figure/_sample_.scriptalertxssscript.html">' +
        "</iframe>"
    );
  });
  itMacro("Two arguments: ID, width", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/border-top-width";
    return assert.eventually.equal(
      macro.call("Example", "100%"),
      '<iframe class="sample-code-frame"' +
        ' title="Example sample"' +
        ' id="frame_example"' +
        ' width="100%"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/CSS/border-top-width/_sample_.example.html">' +
        "</iframe>"
    );
  });
  itMacro("Two arguments: ID, XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/border-top-width";
    return assert.eventually.equal(
      macro.call("Example", '"><script>alert("XSS");</script>'),
      '<iframe class="sample-code-frame"' +
        ' title="Example sample"' +
        ' id="frame_example"' +
        ' width="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt;"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/CSS/border-top-width/_sample_.example.html">' +
        "</iframe>"
    );
  });
  itMacro("Three arguments: ID, width, height", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Images", "100%", 250),
      '<iframe class="sample-code-frame"' +
        ' title="Images sample"' +
        ' id="frame_images"' +
        ' width="100%" height="250"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/HTML/Element/figure/_sample_.images.html">' +
        "</iframe>"
    );
  });
  itMacro("Three arguments: unicode ID, width, height", function (macro) {
    macro.ctx.env.url =
      "/zh-CN/docs/Web/CSS/CSS_Animations/Using_CSS_animations";
    return assert.eventually.equal(
      macro.call("增加关键帧", "100%", "250"),
      '<iframe class="sample-code-frame"' +
        ' title="增加关键帧 sample"' +
        ' id="frame_增加关键帧"' +
        ' width="100%" height="250"' +
        ' src="https://mdn.mozillademos.org/zh-CN/docs/Web/CSS/CSS_Animations/Using_CSS_animations/_sample_.%E5%A2%9E%E5%8A%A0%E5%85%B3%E9%94%AE%E5%B8%A7.html">' +
        "</iframe>"
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
      '<iframe class="sample-code-frame"' +
        ' title="%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%9D%BF%E9%AA%A8%E6%9E%B6 sample"' +
        ' id="frame_一个模板骨架"' +
        ' width="160" height="160"' +
        ' src="https://mdn.mozillademos.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Basic_usage/_sample_.%E4%B8%80%E4%B8%AA%E6%A8%A1%E6%9D%BF%E9%AA%A8%E6%9E%B6.html">' +
        "</iframe>"
    );
  });
  itMacro("Three arguments: ID, width, XSS attempt (failed)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/HTML/Element/figure";
    return assert.eventually.equal(
      macro.call("Images", "100%", '"><script>alert("XSS");</script>'),
      '<iframe class="sample-code-frame"' +
        ' title="Images sample"' +
        ' id="frame_images"' +
        ' width="100%" height="&#34;&gt;&lt;script&gt;alert(&#34;XSS&#34;);&lt;/script&gt;"' +
        ' src="https://mdn.mozillademos.org/en-US/docs/Web/HTML/Element/figure/_sample_.images.html">' +
        "</iframe>"
    );
  });
  const same_slug_iframe =
    '<iframe class="sample-code-frame"' +
    ' title="Examples sample"' +
    ' id="frame_examples"' +
    ' width="700px" height="700px"' +
    ' src="https://mdn.mozillademos.org/en-US/docs/Web/CSS/flex-wrap/_sample_.examples.html">' +
    "</iframe>";
  itMacro("Three arguments: ID, width, height (same slug)", function (macro) {
    macro.ctx.env.url = "/en-US/docs/Web/CSS/flex-wrap";
    return assert.eventually.equal(
      macro.call("Examples", "700px", "700px"),
      same_slug_iframe
    );
  });
});
