import cheerio from "cheerio";
import Prism from "prismjs";
// import loadLanguages from "prismjs/components/";

export function fixSyntaxHighlighting(document) {
  function getPrismPluginName(classList) {
    for (let cls of classList) {
      if (/language-\w+/.test(cls)) {
        const name = cls.replace(/^language-/, "").trim();
        if (Prism.languages[name]) {
          return name;
        } else {
          console.warn(
            `Looks like a syntax highlighting marker but not found as a Prism plugin: ${name}`
          );
        }
      }
    }
    // No good match
    return null;
  }

  // Loop over all prose sections that look for <pre><code> blocks
  // that might have a syntax highlighting marker.
  document.body
    .filter(thing => {
      return thing.type === "prose" && thing.value && thing.value.content;
    })
    .forEach(section => {
      const $ = cheerio.load(section.value.content);
      let mutations = 0;
      $("pre > code").each((_, blob) => {
        const elem = $(blob);
        const cls = elem.attr("class");
        if (!cls) return; // bail!
        const classList = cls.split(/\s+/);
        const prismPluginName = getPrismPluginName(classList);
        if (!prismPluginName) return; // bail!
        const code = elem.text();
        const html = Prism.highlight(
          code,
          Prism.languages[prismPluginName],
          prismPluginName
        );
        elem.html(html);
        mutations++;
      });
      if (mutations) {
        section.value.content = $.html();
      }
    });

  // Now loop over, and mutate, all 'example' sections
  document.body
    .filter(thing => thing.type === "examples")
    .forEach(section => {
      section.value
        .filter(block => block.sources)
        .forEach(block => {
          Object.entries(block.sources).forEach(([key, source]) => {
            if (Prism.languages[key]) {
              const html = Prism.highlight(source, Prism.languages[key], key);
              block.sources[`${key}_html`] = html;
            }
          });
        });
    });
}
