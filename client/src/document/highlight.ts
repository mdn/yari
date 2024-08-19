import Prism from "prismjs";

const LANGS = [
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
];
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

export async function highlightSyntax(element: Element, language: string) {
  const resolvedLanguage = ALIASES.get(language) || language;
  if (IGNORE.has(resolvedLanguage)) {
    return;
  }

  let prismLanguage = Prism.languages[resolvedLanguage];
  if (!prismLanguage) {
    if (LANGS.includes(resolvedLanguage)) {
      await import(`prismjs/components/prism-${resolvedLanguage}.js`);
    } else if (resolvedLanguage === "svelte") {
      await import("prism-svelte");
    }
  }
  prismLanguage = Prism.languages[resolvedLanguage];

  if (prismLanguage) {
    element.innerHTML = Prism.highlight(element.textContent, prismLanguage);
  }
}
