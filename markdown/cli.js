const fs = require("fs");

const fm = require("front-matter");
const program = require("@caporal/core").default;
const chalk = require("chalk");

const { h2m, m2h, withFm } = require(".");

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
  .argument("<htmlFile>", "input HTML file", {
    validator: (f) => {
      if (!fs.existsSync(f)) {
        throw new Error(`${f} does not exist`);
      }
      return f;
    },
  })
  .argument("[mdFile]", "output Markdown file")
  .action(
    tryOrExit(async ({ args }) => {
      const { htmlFile } = args;
      const mdFile = args.mdFile || htmlFile.replace(/\.html$/, ".md");
      const raw = fs.readFileSync(htmlFile, { encoding: "utf-8" });
      const { body: h, frontmatter } = fm(raw);
      const m = await h2m(h);
      fs.writeFileSync(mdFile, withFm(frontmatter, m));
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
      const h = await m2h(m);
      fs.writeFileSync(htmlFile, withFm(frontmatter, h));
    })
  );

program.run();
