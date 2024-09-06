import Prism from "prismjs";
import components from "prismjs/components";

const PRISM_LANGUAGES = components.languages as Record<
  string,
  {
    alias?: string | string[];
    require?: string | string[];
    optional?: string | string[];
    [key: string]: any;
  }
>;

Prism.manual = true;

// Add things to this list to help make things convenient. Sometimes
// there are `<pre class="brush: foo">` whose name is not that which
// Prism expects. It'd be hard to require that content writers
// have to stick to the exact naming conventions that Prism uses
// because Prism is an implementation detail.
const ALIASES = new Map([
  ["vue", "markup"], // See https://github.com/PrismJS/prism/issues/1665#issuecomment-536529608
  ...Object.entries(PRISM_LANGUAGES).flatMap(([lang, config]) => {
    if (config.alias) {
      const aliases =
        typeof config.alias === "string" ? [config.alias] : config.alias;
      return aliases.map((alias) => [alias, lang] satisfies [string, string]);
    }
    return [];
  }),
]);

export async function highlightSyntax(element: Element, language: string) {
  const resolvedLanguage = ALIASES.get(language) || language;

  try {
    await importLanguage(resolvedLanguage);
  } catch {
    return;
  }

  const prismLanguage = Prism.languages[resolvedLanguage];
  if (prismLanguage) {
    element.innerHTML = `<code>${Prism.highlight(element.textContent || "", prismLanguage, resolvedLanguage)}</code>`;
  }
}

async function importLanguage(language: string) {
  const prismLanguage = Prism.languages[language];

  if (!prismLanguage) {
    if (language === "svelte") {
      try {
        await import(
          /* webpackChunkName: "prism-svelte" */
          "prism-svelte"
        );
      } catch (e) {
        console.warn(`Failed to import ${language} prism language`);
        throw e;
      }
    } else {
      const config = PRISM_LANGUAGES[language];
      if (config.require) {
        try {
          await Promise.all(
            (typeof config.require === "string"
              ? [config.require]
              : config.require
            ).map((dependency) => importLanguage(dependency))
          );
        } catch {
          return;
        }
      }
      if (config.optional) {
        await Promise.allSettled(
          (typeof config.optional === "string"
            ? [config.optional]
            : config.optional
          ).map((dependency) => importLanguage(dependency))
        );
      }
      try {
        await import(
          /* webpackChunkName: "[request]" */
          /* webpackExclude: /\.min\.js$/ */
          `prismjs/components/prism-${language}.js`
        );
      } catch (e) {
        console.warn(`Failed to import ${language} prism language`);
        throw e;
      }
    }
  }
}
