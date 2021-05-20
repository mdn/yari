const fs = require("fs");

const fm = require("front-matter");
const program = require("@caporal/core").default;
const chalk = require("chalk");
const cliProgress = require("cli-progress");

const { Document } = require("../content");
const h2m = require("./h2m");
const { m2h, withFm } = require(".");

function tryOrExit(f) {
  return async ({ options = {}, ...args }) => {
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

const toCountMap = (occurences) => {
  const countMap = new Map();
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
  .option("--mode <mode>", 'Can be "dry" or "replace"', { default: "replace" })
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

      let totalUnhandledCount = 0;
      const unhandledReportLines = [];
      for (let doc of documents.iter()) {
        progressBar.increment();
        if (doc.isMarkdown) {
          continue;
        }
        const { body: h, frontmatter } = fm(doc.rawContent);
        const [markdown, unhandled] = await h2m(h);
        if (unhandled.length) {
          totalUnhandledCount += unhandled.length;
          unhandledReportLines.push(
            doc.url,
            ...Array.from(toCountMap(unhandled))
              .sort(([, c1], [, c2]) => c1 > c2)
              .map(([key, count]) => `${key} (${count})`),
            ""
          );
        }
        if (options.mode == "replace") {
          fs.writeFileSync(
            doc.fileInfo.path.replace(/\.html$/, ".md"),
            withFm(frontmatter, markdown)
          );
          fs.rmSync(doc.fileInfo.path);
        }
      }
      progressBar.stop();

      if (totalUnhandledCount) {
        const reportFileName = `unconvertible-md-elements-report-${new Date().toISOString()}.txt`;
        console.log(
          `Could not automatically convert ${totalUnhandledCount} elements. Saving report to ${reportFileName}`
        );
        fs.writeFileSync(reportFileName, unhandledReportLines.join("\n"));
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
