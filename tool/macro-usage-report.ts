import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

import { ACTIVE_LOCALES, DEFAULT_LOCALE } from "../libs/constants";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env";

const YARI = path.normalize(path.join(__dirname, ".."));
const MACRO_PATH = path.join(YARI, "kumascript", "macros");

async function getMacros(): Promise<string[]> {
  const macroFilenames = await fs.readdir(MACRO_PATH);
  const macros = macroFilenames
    .map((filename) => path.basename(filename, ".ejs"))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  return macros;
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
  macros: string[]
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

  const macroMap = new Map<string, string>(
    macros.map((macro) => [macro.toLowerCase(), macro])
  );

  for (const { macro, file } of matches) {
    const macroName = macroMap.get(macro.toLowerCase()) as string;
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

function formatCell(files: string[], limit = 2): string {
  if (files.length === 0) {
    return "-";
  }

  return `<span title="${files[0]} …">${files.length}</span>`;
}

async function writeMarkdownTable(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  {
    deprecatedMacros,
  }: {
    deprecatedMacros: string[];
  }
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

  for (const macro of macros) {
    const files = filesByMacro[macro];
    const macroCell = deprecatedMacros.includes(macro) ? `${macro} 🗑` : macro;

    const paths = [MACRO_PATH, ...[...ACTIVE_LOCALES].map(getPathByLocale)];

    const cells = [
      macroCell,
      ...paths.map((path) => formatCell(filterFilesByBase(files, path))),
    ];

    process.stdout.write(`|${cells.map((cell) => ` ${cell} `).join("|")}|\n`);
  }
}

function writeJson(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  {
    deprecatedMacros,
  }: {
    deprecatedMacros: string[];
  }
) {
  const result = {};
  const macros = Object.keys(filesByMacro);

  for (const macro of macros) {
    const files = filesByMacro[macro];
    result[macro] = {
      name: macro,
      deprecated: deprecatedMacros.includes(macro),
      files: [...files].map((file) =>
        file
          .replace(CONTENT_ROOT, "content")
          .replace(CONTENT_TRANSLATED_ROOT, "translated-content")
          .replace(YARI, "yari")
      ),
    };
  }

  const json = JSON.stringify(result, null, 2);

  process.stdout.write(json);
}

export async function macroUsageReport({
  deprecatedOnly,
  format,
}: {
  deprecatedOnly: boolean;
  format: "md-table" | "json";
}) {
  const macros = await getMacros();
  const deprecatedMacros = macros.filter((macro) => isMacroDeprecated(macro));

  const filesByMacro = await getFilesByMacro(
    deprecatedOnly ? deprecatedMacros : macros
  );

  switch (format) {
    case "md-table":
      return writeMarkdownTable(filesByMacro, { deprecatedMacros });

    case "json":
      return writeJson(filesByMacro, { deprecatedMacros });
  }
}
