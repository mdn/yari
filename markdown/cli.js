const fs = require("fs");

const fm = require("front-matter");
const program = require("@caporal/core").default;
const chalk = require("chalk");

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

program
  .bin("yarn md")
  .name("md")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)

  .command("h2m", "Convert HTML to Markdown")
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args }) => {
      const all = Document.findAll({ folderSearch: args.folder });
      for (const doc of all.iter()) {
        if (doc.isMarkdown) {
          continue;
        }
        const { body: h, frontmatter } = fm(doc.rawContent);
        const m = await h2m.run(h);
        fs.writeFileSync(
          doc.fileInfo.path.replace(/\.html$/, ".md"),
          withFm(frontmatter, m)
        );
      }
    })
  )

  .command("m2h", "Convert Markdown to HTML")
  .argument("<mdFile>", "input Markdown file", {
    validator: (f) => {
      if (!fs.existsSync(f)) {
        throw new Error(`${f} does not exist`);
      }
      return f;
    },
  })
  .argument("[htmlFile]", "output HTML file")
  .action(
    tryOrExit(async ({ args }) => {
      const { mdFile } = args;
      const htmlFile = args.htmlFile || mdFile.replace(/\.md$/, ".html");
      const raw = fs.readFileSync(mdFile, { encoding: "utf-8" });
      const { body: m, frontmatter } = fm(raw);
      const h = await m2h.run(m);
      fs.writeFileSync(htmlFile, withFm(frontmatter, h));
    })
  )

  .command("check-content", "checks content for Markdown convertibility")
  .argument("[folder]", "filter content by folder")
  .action(
    tryOrExit(async ({ args }) => {
      const all = Document.findAll({ folderSearch: args.folder });
      const bySelector = new Map();
      for (const doc of all.iter()) {
        const unhandled = await h2m.dryRun(doc.rawContent);
        for (const selector of unhandled) {
          const { count, urls } = bySelector.get(selector) || {
            count: 0,
            urls: [],
          };
          bySelector.set(selector, {
            count: count + 1,
            urls: urls.concat(doc.url),
          });
        }
      }

      console.log(
        Array.from(bySelector)
          .sort(([, e1], [, e2]) => (e1.count < e2.count ? 1 : -1))
          .map(([selector, { count, urls }]) => [
            selector,
            count,
            `"${Array.from(new Set(urls)).join("\n")}"`,
          ])
          .join("\n")
      );
    })
  );

program.run();
