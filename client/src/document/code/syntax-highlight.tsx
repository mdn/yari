import Prism from "prismjs";
import components from "prismjs/components";
import { useMemo, useState, useEffect } from "react";

Prism.manual = true;

const PRISM_LANGUAGES = components.languages as Record<
  string,
  {
    alias?: string | string[];
    require?: string | string[];
    optional?: string | string[];
    [key: string]: any;
  }
>;

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

interface HighlightedCodeProps extends React.HTMLAttributes<HTMLElement> {
  language?: string;
  children: React.ReactNode;
}

export function CodeWithSyntaxHighlight({
  language,
  children,
  ...props
}: HighlightedCodeProps) {
  const initial = useMemo(
    // needed to prevent flashing
    () =>
      language ? highlightStringSync(String(children), language) : undefined,
    [children, language]
  );
  const [html, setHtml] = useState(initial);

  useEffect(() => {
    (async () => {
      if (language) {
        const highlighted = await highlightString(String(children), language);
        setHtml(highlighted);
      }
    })();
  }, [children, language]);

  return html ? (
    <code {...props} dangerouslySetInnerHTML={{ __html: html }}></code>
  ) : (
    <code {...props}>{children}</code>
  );
}

export async function highlightElement(element: Element, language: string) {
  const highlighted = await highlightString(
    element.textContent || "",
    language
  );
  if (highlighted) {
    element.innerHTML = `<code>${highlighted}</code>`;
  }
}

async function highlightString(
  text: string,
  language: string
): Promise<string | undefined> {
  const resolvedLanguage = ALIASES.get(language) || language;

  try {
    await importLanguage(resolvedLanguage);
  } catch {
    return;
  }

  return highlightStringSync(text, language);
}

function highlightStringSync(
  text: string,
  language: string
): string | undefined {
  const resolvedLanguage = ALIASES.get(language) || language;
  const prismLanguage = Prism.languages[resolvedLanguage];
  if (prismLanguage) {
    try {
      return Prism.highlight(text, prismLanguage, resolvedLanguage);
    } catch {
      console.warn("Syntax highlighting: prism error");
    }
  }
  return;
}

async function importLanguage(language: string, recursiveDepth = 0) {
  if (recursiveDepth > 100) {
    console.warn("Syntax highlighting: recursion error");
    throw new Error("Syntax highlighting: recursion error");
  }

  const prismLanguage = Prism.languages[language];

  if (!prismLanguage) {
    if (language === "svelte") {
      try {
        await import(
          /* webpackChunkName: "prism-svelte" */
          "prism-svelte"
        );
      } catch (e) {
        console.warn(
          `Syntax highlighting: failed to import ${language} prism language`
        );
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
            ).map((dependency) =>
              importLanguage(dependency, recursiveDepth + 1)
            )
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
          ).map((dependency) => importLanguage(dependency, recursiveDepth + 1))
        );
      }
      try {
        await import(
          /* webpackChunkName: "[request]" */
          /* webpackExclude: /\.min\.js$/ */
          `prismjs/components/prism-${language}.js`
        );
      } catch (e) {
        console.warn(
          `Syntax highlighting: failed to import ${language} prism language`
        );
        throw e;
      }
    }
  }
}
