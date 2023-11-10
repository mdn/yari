import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { ACTIVE_LOCALES, DEFAULT_LOCALE } from "../libs/constants/index.js";
import { CONTENT_ROOT, CONTENT_TRANSLATED_ROOT } from "../libs/env/index.js";

const YARI_URL = new URL("..", import.meta.url);
const MACROS_URL = new URL("kumascript/macros", YARI_URL);
const YARI_PATH = fileURLToPath(YARI_URL);
const MACROS_PATH = fileURLToPath(MACROS_URL);

async function getMacros(): Promise<string[]> {
  const macroFilenames = await fs.readdir(MACROS_PATH);
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
      findMatches(
        `\\{\\{\\s*(${macroNames.join("|")})\\b`,
        [CONTENT_ROOT, CONTENT_TRANSLATED_ROOT].filter(Boolean)
      ),
      findMatches(`template\\(["'](${macroNames.join("|")})["']`, [
        MACROS_PATH,
      ]),
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

function getPathByLocale(locale: string): string | null {
  const root =
    locale.toLowerCase() === DEFAULT_LOCALE.toLowerCase()
      ? CONTENT_ROOT
      : CONTENT_TRANSLATED_ROOT;

  if (!root) {
    return null;
  }

  return path.join(root, locale.toLowerCase());
}

async function filterDeprecatedMacros(macros: string[]) {
  return (
    await Promise.all(
      macros.map(async (macro) =>
        isMacroDeprecated(macro).then((isDeprecated) =>
          isDeprecated ? macro : null
        )
      )
    )
  ).filter(Boolean);
}

async function isMacroDeprecated(macro: string) {
  const file = path.join(MACROS_PATH, `${macro}.ejs`);
  const content = await fs.readFile(file, "utf-8");

  return content.includes("mdn.deprecated(");
}

function formatCell(files: string[]): string {
  if (files.length === 0) {
    return "-";
  }

  return `<span title="${files[0]} …">${files.length}</span>`;
}

function createTable(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  deprecatedMacros: string[]
) {
  const columns = ["yari"];
  const paths = [MACROS_PATH];

  for (const locale of ACTIVE_LOCALES) {
    const path = getPathByLocale(locale);
    if (path) {
      columns.push(locale);
      paths.push(path);
    }
  }

  const table: any[][] = [["macro", ...columns]];

  const macros = Object.keys(filesByMacro);
  for (const macro of macros) {
    const files = filesByMacro[macro];
    const macroCell = deprecatedMacros.includes(macro) ? `${macro} 🗑` : macro;

    table.push([
      macroCell,
      ...paths.map((path) => filterFilesByBase(files, path)),
    ]);
  }

  return table;
}

function writeMarkdownTable(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  {
    deprecatedMacros,
  }: {
    deprecatedMacros: string[];
  }
) {
  const table = createTable(filesByMacro, deprecatedMacros);
  const headerRow = table.shift();

  process.stdout.write(`| ${headerRow.join(" | ")} |\n`);
  process.stdout.write(
    `|:----- |${headerRow
      .slice(1)
      .map((column) => ` ${"-".repeat(column.length)}:`)
      .join("|")}|\n`
  );

  for (const row of table) {
    process.stdout.write(
      `| ${row
        .map((cell) =>
          Array.isArray(cell) ? ` ${formatCell(cell)} ` : ` ${cell} `
        )
        .join(" | ")} |\n`
    );
  }
}

function writeCsvTable(
  filesByMacro: {
    [macro: string]: Iterable<string>;
  },
  {
    deprecatedMacros,
  }: {
    deprecatedMacros: string[];
  }
) {
  const table = createTable(filesByMacro, deprecatedMacros);
  for (const row of table) {
    process.stdout.write(
      `${row
        .map((cell) => (Array.isArray(cell) ? `${cell.length}` : `${cell}`))
        .join(",")}\n`
    );
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
          .replace(YARI_PATH, "yari/")
      ),
    };
  }

  const json = JSON.stringify(result, null, 2);

  process.stdout.write(json);
}

export async function macroUsageReport({
  deprecatedOnly,
  format,
  unusedOnly,
}: {
  deprecatedOnly: boolean;
  format: "md-table" | "csv" | "json";
  unusedOnly: boolean;
}) {
  const macros = await getMacros();
  const deprecatedMacros = await filterDeprecatedMacros(macros);

  const filesByMacro = await getFilesByMacro(
    deprecatedOnly ? deprecatedMacros : macros
  );

  if (unusedOnly) {
    for (const [macro, files] of Object.entries(filesByMacro)) {
      if ([...files].length) {
        delete filesByMacro[macro];
      }
    }
  }

  switch (format) {
    case "md-table":
      return writeMarkdownTable(filesByMacro, { deprecatedMacros });

    case "csv":
      return writeCsvTable(filesByMacro, { deprecatedMacros });

    case "json":
      return writeJson(filesByMacro, { deprecatedMacros });
  }
}
