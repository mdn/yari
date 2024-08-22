import * as cheerio from "cheerio";

// Over the years we have accumulated some weird <pre> tags whose
// brush is more or less "junk".
// TODO: Perhaps, if you have a doc with <pre> tags that matches
// this, it should become a flaw.
const IGNORE = new Set(["none", "text", "plain", "unix"]);

/**
 * Mutate the `$` instance by adding headers to <pre> tags containing code blocks.
 *
 */
export function codeHeaders($: cheerio.CheerioAPI) {
  // Our content will be like this: `<pre class="brush:js">` or
  // `<pre class="brush: js">` so we're technically not looking for an exact
  // match. The wildcard would technically match `<pre class="brushetta">`
  // too. But within the loop, we do a more careful regex on the class name
  // and only proceed if it's something sensible.
  $("pre[class*=brush]").each((_, element) => {
    // The language is whatever string comes after the `brush(:)`
    // portion of the class name.
    const $pre = $(element);

    const className = $pre.attr("class").toLowerCase();
    const match = className.match(/brush:?\s*([\w_-]+)/);
    if (!match) {
      return;
    }
    const name = match[1].replace("-nolint", "");
    if (IGNORE.has(name)) {
      // Seems to exist a couple of these in our docs. Just bail.
      return;
    }
    const code = $pre.text();
    $pre.wrapAll(`<div class='code-example'></div>`);
    if (!$pre.hasClass("hidden")) {
      $(
        `<div class='example-header'><span class="language-name">${name}</span></div>`
      ).insertBefore($pre);
    }
    const $code = $("<code>").text(code);

    $pre.empty().append($code);
  });
}
