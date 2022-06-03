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

  // Our content will be like this: `<pre class="brush:js">` or
  // `<pre class="brush: js">` so we're technically not looking for an exact
  // match. The wildcard would technically match `<pre class="brushetta">`
  // too. But within the loop, we do a more careful regex on the class name
  // and only proceed if it's something sensible we can use in Prism.
  $("pre[class*=brush]").each((index, element) => {
    // The language is whatever string comes after the `brush(:)`
    // portion of the class name.
    const $pre = $(element).wrapAll("<div class='code-example'>");

    const className = $pre.attr("class").toLowerCase();
    const match = className.match(/brush:?\s*([\w_-]+)/);
    if (!match) {
      return;
    }
    const language = ALIASES.get(match[1]) || match[1];
    if (IGNORE.has(language)) {
      // Seems to exist a couple of these in our docs. Just bail.
      return;
    }
    const grammar = Prism.languages[language];
    if (!grammar) {
      console.warn(
        `Unable to find a Prism grammar for '${language}' found in ${doc.mdn_url}`
      );
      return; // bail!
    }

    const addLineNumbers = className.match(/linenumbers/);
    const highlightsTag = className.match(/highlight[-\d]+/g);
    let highlights;
    if (highlightsTag) {
      highlights = highlightsTag[0].match(/(?<=-)\d+/g);
      highlights = highlights ? highlights : [];
    }

    const code = $pre.text();
    let html = "";

    if (!addLineNumbers) {
      if (highlightsTag) {
        console.warn(
          `Tag 'linenumbers' must be present to use '${highlightsTag}'.`
        );
      }
      html = Prism.highlight(code, grammar, language);
    } else {
      const env = {
        code: code,
        grammar: grammar,
        language: language,
        codeBlockNo: index + 1,
        highlights: highlights,
      };

      // use lower level APIs for finer control
      env.tokens = Prism.tokenize(code, grammar);
      Prism.plugins.enhance.addLines(env);
      html = Prism.Token.stringify(Prism.util.encode(env.tokens), language);
    }

    const $code = $("<code>").html(html);
    $pre.empty().append($code);
  });
}

// plugin to add line numbers, highlighting, and anchors
Prism.plugins.enhance = {
  createLineToken(children, env, lineNo) {
    const line = new Prism.Token("line", children);
    line.codeBlockNo = env.codeBlockNo;
    line.lineNo = lineNo;

    if (env.highlights.includes(String(lineNo))) {
      line.alias = "highlight";
    }
    return line;
  },

  createLineNumberToken(codeBlockNo, lineNo) {
    const id = `E${codeBlockNo}L${lineNo}`;
    const anchor = `<a id='${id}' href="#${id}" title="">${lineNo}</a>`;
    return new Prism.Token("lineno", anchor);
  },

  addLines(env) {
    if (Array.isArray(env.tokens) && env.tokens.length > 0) {
      const newList = new Array();
      let lineNo = 1;
      let children = [this.createLineNumberToken(env.codeBlockNo, lineNo)];

      // separate the tokens into lines
      env.tokens.forEach((token) => {
        if (typeof token === "string" && token.includes("\n")) {
          let part = "";
          while (token !== "") {
            const position = token.indexOf("\n");
            if (position >= 0) {
              part = token.substring(0, position);
              token = token.substring(position + 1);
            } else {
              part = token;
              token = "";
            }

            children.push(part ? part : "\u200b");
            if (position >= 0) {
              newList.push(this.createLineToken(children, env, lineNo));
              lineNo++;
              children = [this.createLineNumberToken(env.codeBlockNo, lineNo)];
            }
          }
        } else {
          children.push(token);
        }
      });

      if (children.length > 1) {
        newList.push(this.createLineToken(children, env, lineNo));
        lineNo++;
      }

      const outOfRangeNos = env.highlights.filter((h) => h >= lineNo);
      if (outOfRangeNos.length > 0) {
        outOfRangeNos.sort((a, b) => a - b);
        console.warn(`Can not highlight lines: ${outOfRangeNos.join(", ")}`);
      }
      env.tokens = newList;
    }
  },
};

// add a hook to unescape the anchor tag strings
Prism.hooks.add("wrap", function (token) {
  if (token.type === "lineno") {
    token.content = token.content.replaceAll("&lt;", "<");
  }
});

module.exports = { syntaxHighlight };
