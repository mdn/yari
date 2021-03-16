// eslint-disable-next-line node/no-extraneous-require
const visit = require("unist-util-visit");

module.exports = () => {
  return (tree) => {
    visit(tree, "element", visitor);
  };

  function visitor(node, index, parent) {
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
      return;
    }
    // When you use the triple-backtick and a language, like...
    //
    //    ```css
    //    ...
    //
    // What you get is:
    //
    //    <pre><code class="language-css">...
    //
    // Let's now convert that to:
    //
    //    <pre class="brush: css">
    //
    // The reason for doing this is entirely to pretend that nothing has changed.
    // This way, the Markdown gets converted to HTML in the way Yari can process
    // all other existing HTML.

    const classNames = node.properties.className || [];
    for (const className of classNames) {
      if (className.startsWith("language-")) {
        const classNamesBefore = parent.properties.className || [];
        parent.properties.className = [
          `brush: ${className.replace("language-", "").toLowerCase()}`,
          ...classNamesBefore,
        ];
      }
    }
  }
};
