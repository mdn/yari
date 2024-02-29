import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";
import "prism-svelte";
import * as cheerio from "cheerio";
import { createHmac } from "node:crypto";
import { SAMPLE_SIGN_KEY } from "../libs/env/index.js";

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
  // Some languages are always loaded by Prism, so we can omit them here:
  // - Markup (atom, html, markup, mathml, rss, ssml, svg, xml)
  // - CSS (css)
  // - C-like (clike)
  // - JavaScript (javascript, js)
  loadLanguages([
    "apacheconf",
    "bash",
    "batch",
    "c",
    "cpp",
    "cs",
    "diff",
    "django",
    "glsl",
    "handlebars",
    "http",
    "ignore",
    "ini",
    "java",
    "json",
    "jsx",
    "latex",
    "less",
    "md",
    "nginx",
    "php",
    "powershell",
    "pug",
    "python",
    "regex",
    "rust",
    "scss",
    "sql",
    // 'svelte', // Loaded by `prism-svelte` extension
    "toml",
    "tsx",
    "typescript",
    "uri",
    "wasm",
    "webidl",
    "yaml",
  ]);
});

// Add things to this list to help make things convenient. Sometimes
// there are `<pre class="brush: foo">` whose name is not that which
// Prism expects. It'd be hard to require that content writers
// have to stick to the exact naming conventions that Prism uses
// because Prism is an implementation detail.
const ALIASES = new Map([
  ["sh", "shell"],
  ["vue", "markup"], // See https://github.com/PrismJS/prism/issues/1665#issuecomment-536529608
]);

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
export function syntaxHighlight($: cheerio.CheerioAPI, doc) {
  loadAllLanguages();

  // Our content will be like this: `<pre class="brush:js">` or
  // `<pre class="brush: js">` so we're technically not looking for an exact
  // match. The wildcard would technically match `<pre class="brushetta">`
  // too. But within the loop, we do a more careful regex on the class name
  // and only proceed if it's something sensible we can use in Prism.
  $("pre[class*=brush]").each((_, element) => {
    // The language is whatever string comes after the `brush(:)`
    // portion of the class name.
    const $pre = $(element);

    const className = $pre.attr("class").toLowerCase();
    const match = className.match(/brush:?\s*([\w_-]+)/);
    if (!match) {
      return;
    }
    let name = match[1].replace("-nolint", "");
    if (ALIASES.has(name)) {
      name = ALIASES.get(name);
    }
    if (IGNORE.has(name)) {
      // Seems to exist a couple of these in our docs. Just bail.
      return;
    }
    const code = $pre.text();
    if (SAMPLE_SIGN_KEY) {
      const hmac = createHmac("sha256", SAMPLE_SIGN_KEY);
      hmac.update(name.toLowerCase());
      hmac.update(code);
      const signature = hmac.digest("base64");
      $pre.attr("data-signature", signature);
    }
    $pre.wrapAll(`<div class='code-example'></div>`);
    if (!$pre.hasClass("hidden")) {
      $(
        `<div class='example-header'><span class="language-name">${name}</span></div>`
      ).insertBefore($pre);
    }
    const grammar = Prism.languages[name];
    if (!grammar) {
      console.warn(
        `Unable to find a Prism grammar for '${name}' found in ${doc.mdn_url}`
      );
      return; // bail!
    }
    const html = Prism.highlight(code, grammar, name);
    const $code = $("<code>").html(html);

    $pre.empty().append($code);
  });
}
