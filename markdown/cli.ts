import * as fs from "fs";
const fm = require("front-matter");
import { program } from "@caporal/core";
import * as chalk from "chalk";
import * as cliProgress from "cli-progress";
import { Document } from "../content";

import { h2m } from "./h2m";
const { prettyAST } = require("./utils");
import { m2h, withFm } from ".";
import { toSelector } from "./h2m/utils";
import { h } from "./h2m/h";

function tryOrExit(f) {
  return async ({
    options = {},
    ...args
  }: {
    options: { verbose?: boolean; v?: boolean };
  }) => {
    try {
      await f({ options, ...args });
    } catch (error) {
      if (options.verbose || options.v) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}

const toCountMap = (occurences: string[]) => {
  const countMap = new Map<string, number>();
  for (const key of occurences) {
    if (!countMap.has(key)) {
      countMap.set(key, 0);
    }
    countMap.set(key, countMap.get(key) + 1);
  }
  return countMap;
};

program
  .bin("yarn md")
  .name("md")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)

  .command("h2m", "Convert HTML to Markdown")
  .option("--mode <mode>", "Mode to be run in", {
    default: "keep",
    validator: ["dry", "keep", "replace"],
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      console.log(
        `Starting HTML to Markdown conversion in ${options.mode} mode`
      );

      const documents = Document.findAll({ folderSearch: args.folder });

      const progressBar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic
      );
      progressBar.start(documents.count);

      const problems = new Map<
        string,
        { offset: number; invalid: []; unhandled: [] }
      >();
      try {
        for (let doc of documents.iter()) {
          progressBar.increment();
          if (doc.isMarkdown) {
            continue;
          }
          const { body: h, frontmatter } = fm(doc.rawContent);
          const [markdown, { invalid, unhandled }] = await h2m(h);

          if (invalid.length > 0 || unhandled.length > 0) {
            problems.set(doc.url, {
              offset: doc.fileInfo.frontMatterOffset,
              invalid,
              unhandled,
            });
          }

          if (options.mode == "replace" || options.mode == "keep") {
            fs.writeFileSync(
              doc.fileInfo.path.replace(/\.html$/, ".md"),
              withFm(frontmatter, markdown)
            );
            if (options.mode == "replace") {
              fs.unlinkSync(doc.fileInfo.path);
            }
          }
        }
      } finally {
        progressBar.stop();
      }

      const now = new Date();
      const report = [
        `# Report from ${now.toLocaleString()}`,

        "## Top 20 unhandled elements",
        ...Array.from(
          Array.from(problems)
            .flatMap(([, { invalid, unhandled }]) => [
              ...invalid.map((e: any) => e.source),
              ...unhandled,
            ])
            .map((node) =>
              node.type == "element" ? toSelector(node) : node.type
            )
            .reduce(
              (top, label) => top.set(label, (top.get(label) || 0) + 1),
              new Map()
            )
        )
          .sort(([, c1], [, c2]) => (c1 > c2 ? -1 : 1))
          .slice(0, 20)
          .map(([label, count]) => `- ${label} (${count})`),

        "## Details per Document",
      ];
      let problemCount = 0;
      for (const [url, { offset, invalid, unhandled }] of Array.from(
        problems
      )) {
        problemCount += invalid.length + unhandled.length;
        report.push(`### [${url}](https://developer.mozilla.org${url})`);

        const elementWithPosition = (node) => {
          const {
            type,
            position: {
              start: { line, column },
            },
          } = node;
          const label = type == "element" ? toSelector(node) : type;
          return `${label} (${line + offset}:${column})`;
        };

        if (invalid.length > 0) {
          report.push(
            "#### Invalid AST transformations",
            ...invalid.map(({ source, targetType, unexpectedChildren }: any) =>
              [
                `##### ${elementWithPosition(source)} => ${targetType}`,
                "```",
                unexpectedChildren.map((node) => prettyAST(node)),
                "```",
              ].join("\n")
            )
          );
        }

        if (unhandled.length > 0) {
          report.push(
            "### Missing conversion rules",
            ...unhandled.map((node) => "- " + elementWithPosition(node))
          );
        }
      }
      if (problemCount > 0) {
        const reportFileName = `md-conversion-problems-report-${now.toISOString()}.md`;
        console.log(
          `Could not automatically convert ${problemCount} elements. Saving report to ${reportFileName}`
        );
        fs.writeFileSync(reportFileName, report.join("\n"));
      }
    })
  )

  .command("m2h", "Convert Markdown to HTML")
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args }) => {
      const all = Document.findAll({ folderSearch: args.folder });
      for (let doc of all.iter()) {
        if (!doc.isMarkdown) {
          continue;
        }
        const { body: m, frontmatter } = fm(doc.rawContent);
        const h = await m2h(m);
        fs.writeFileSync(
          doc.fileInfo.path.replace(/\.md$/, ".html"),
          withFm(frontmatter, h)
        );
      }
    })
  );

program.run();
