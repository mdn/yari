const Prism = require("prismjs");
const loadLanguages = require("prismjs/components/index");

const lazy = (creator) => {
  let res;
  let processed = false;
  return (...args) => {
    if (processed) return res;
    res = creator.apply(this, args);
    processed = true;
    return res;
  };
};

const loadAllLanguages = lazy(() => {
  loadLanguages([
    "python",
    "bash",
    "sql",
    "json",
    "glsl",
    "php",
    "cpp",
    "java",
    "http",
    "wasm",
    "rust",
    "toml",
  ]);
});

// Add things to this list to help make things convenient. Sometimes
// there are `<pre class="brush: foo">` whose name is not that which
// Prism expects. It'd be hard to require that content writers
// have to stick to the exact naming conventions that Prism uses
// because Prism is an implementation detail.
const ALIASES = new Map([["sh", "shell"]]);

// Over the years we have accumulated some weird <pre> tags whose
// brush is more or less "junk".
// TODO: Perhaps, if you have a doc with <pre> tags that matches
// this, it should become a flaw.
const IGNORE = new Set(["none", "text", "plain", "unix"]);

/**
 * Mutate the `$` instance for by looking for <pre> tags that can be
 * syntax highlighted with Prism.
 *
 */
function syntaxHighlight($, doc) {
  loadAllLanguages();

  $("pre[class*=brush]").each((_, element) => {
    // The language is whatever string comes after the `brush(:)`
    // portion of the class name.
    const $pre = $(element);
    const className = $pre.attr("class").toLowerCase();
    const match = className.match(/brush:?\s*([\w_-]+)/);
    if (!match) {
      return;
    }
    const name = ALIASES.get(match[1]) || match[1];
    if (IGNORE.has(name)) {
      // Seems to exist a couple of these in our docs. Just bail.
      return;
    }
    const grammar = Prism.languages[name];
    if (!grammar) {
      console.warn(
        `Unable to find a Prism grammar for '${name}' found in ${doc.mdn_url}`
      );
      return; // bail!
    }
    const code = $pre.text();
    const html = Prism.highlight(code, grammar, name);
    const $code = $("<code>").html(html);
    $pre.empty().append($code);
  });
}

module.exports = { syntaxHighlight };
