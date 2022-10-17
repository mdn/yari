import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "child_process";
import { ACTIVE_LOCALES, DEFAULT_LOCALE } from "../libs/constants";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env";

const MACRO_PATH = path.join(__dirname, "..", "kumascript", "macros");

async function getMacros(): Promise<Map<string, string>> {
  const macroFilenames = await fs.readdir(MACRO_PATH);
  const macros = macroFilenames
    .map((filename) => path.basename(filename, ".ejs"))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return new Map<string, string>(
    macros.map((macro) => [macro.toLowerCase(), macro])
  );
}

async function exec(
  command: string,
  args?: ReadonlyArray<string>
): Promise<string> {
  const child = spawn(command, args);

  let stdout = "";
  child.stdout.setEncoding("utf-8");
  child.stdout.on("data", (chunk) => (stdout += chunk));
  await new Promise((resolve) => child.on("close", resolve));

  return stdout;
}

async function findMatches(pattern: string, paths: string[]) {
  const stdout = await exec("rg", ["-i", pattern, ...paths]);

  const lines = stdout.split("\n").filter((line) => line.length > 0);

  const regexp = new RegExp(pattern, "ig");
  const matches: { macro: string; file: string }[] = [];

  for (const line of lines) {
    const parts = line.split(":");
    const file = parts[0];
    const match = parts.slice(1).join(":");
    for (const [, macro] of match.matchAll(regexp)) {
      matches.push({ macro, file });
    }
  }

  return matches;
}

async function getFilesByMacro(
  macros: Map<string, string>
): Promise<{ [macro: string]: Iterable<string> }> {
  const macroNames = [...macros.values()];
  const matches = (
    await Promise.all([
      findMatches(`\\{\\{\\s*(${macroNames.join("|")})\\b`, [
        CONTENT_ROOT,
        CONTENT_TRANSLATED_ROOT,
      ]),
      findMatches(`template\\(["'](${macroNames.join("|")})["']`, [MACRO_PATH]),
    ])
  ).flat();

  const filesByMacro: { [macro: string]: Set<string> } = {};
  macroNames.forEach((macro) => (filesByMacro[macro] = new Set()));

  for (const { macro, file } of matches) {
    const macroName = macros.get(macro.toLowerCase()) as string;
    filesByMacro[macroName].add(file);
  }

  return filesByMacro;
}

function filterFilesByBase(files: Iterable<string>, base: string): string[] {
  return [...files]
    .filter((file) => file.startsWith(base))
    .map((file) => file.replace(base, ""))
    .sort();
}

function getPathByLocale(locale: string): string {
  const root =
    locale.toLowerCase() === DEFAULT_LOCALE.toLowerCase()
      ? CONTENT_ROOT
      : CONTENT_TRANSLATED_ROOT;

  return path.join(root, locale.toLowerCase());
}

async function isMacroDeprecated(macro: string) {
  const file = path.join(MACRO_PATH, `${macro}.ejs`);
  const content = await fs.readFile(file, "utf-8");

  return content.includes("mdn.deprecated()");
}

async function getDeprecatedMacros() {
  const macros = await getMacros();
  const deprecatedMacros: string[] = [];

  await Promise.all(
    [...macros.values()].map(
      async (macro) =>
        (await isMacroDeprecated(macro)) && deprecatedMacros.push(macro)
    )
  );

  return deprecatedMacros;
}

function formatCell(files: string[], limit = 2): string {
  if (files.length === 0) {
    return "0";
  }

  return `<span title="${files[0]} …">${files.length}</span>`;
}

async function writeMarkdownTable(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  deprecatedOnly: string
) {
  const columns = ["yari", ...ACTIVE_LOCALES];
  process.stdout.write(
    `| macro |${columns.map((column) => ` ${column} `).join("|")}|\n`
  );
  process.stdout.write(
    `|:----- |${columns
      .map((column) => ` ${"-".repeat(column.length)}:`)
      .join("|")}|\n`
  );

  const macros = Object.keys(filesByMacro);
  const deprecatedMacros = await getDeprecatedMacros();

  for (const macro of macros) {
    const files = filesByMacro[macro];
    const macroCell = deprecatedMacros.includes(macro) ? `${macro} 🗑` : macro;

    const paths = [MACRO_PATH, ...[...ACTIVE_LOCALES].map(getPathByLocale)];

    const cells = [
      macroCell,
      ...paths.map((path) => formatCell(filterFilesByBase(files, path))),
    ];

    if (deprecatedOnly && deprecatedMacros.includes(macro)) {
      process.stdout.write(`|${cells.map((cell) => ` ${cell} `).join("|")}|\n`);
    } else if (!deprecatedOnly) {
      process.stdout.write(`|${cells.map((cell) => ` ${cell} `).join("|")}|\n`);
    }
  }
}

async function main() {
  const macros = await getMacros();
  const filesByMacro = await getFilesByMacro(macros);
  // get the optional `deprecated-only` flag
  const deprecatedOnly = process.argv.slice(2, 3)[0];

  await writeMarkdownTable(filesByMacro, deprecatedOnly);
}

main();
