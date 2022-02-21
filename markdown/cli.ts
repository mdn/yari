import * as fs from "fs";
const fm = require("front-matter");
const cheerio = require("cheerio");
import { program } from "@caporal/core";
import * as chalk from "chalk";
import * as cliProgress from "cli-progress";
import { Document } from "../content";
import { saveFile } from "../content/document";
import { VALID_LOCALES } from "../libs/constants";
import { execGit } from "../content";
import { getRoot } from "../content/utils";
import { render } from "../kumascript/src/render.js";

import { h2m } from "./h2m";
const { prettyAST } = require("./utils");
import { m2h } from ".";
import { toSelector } from "./h2m/utils";
const specs = require("browser-specs");
const web = require("../kumascript/src/api/web.js");

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

function saveProblemsReport(problems: Map<any, any>) {
  const now = new Date();
  const report = [
    `# Report from ${now.toLocaleString()}`,

    "## All unhandled elements",
    ...Array.from(
      Array.from(problems)
        .flatMap(([, { invalid, unhandled }]) => [
          ...invalid.map((e: any) => e.source),
          ...unhandled,
        ])
        .map((node) => (node.type == "element" ? toSelector(node) : node.type))
        .reduce(
          (top, label) => top.set(label, (top.get(label) || 0) + 1),
          new Map()
        )
    )
      .sort(([, c1], [, c2]) => (c1 > c2 ? -1 : 1))
      .map(([label, count]) => `- ${label} (${count})`),

    "## Details per Document",
  ];
  let problemCount = 0;
  for (const [url, { offset, invalid, unhandled }] of Array.from(problems)) {
    problemCount += invalid.length + unhandled.length;
    report.push(`### [${url}](https://developer.mozilla.org${url})`);

    const elementWithPosition = (node) => {
      const { type, position } = node;
      const label = type == "element" ? toSelector(node) : type;
      if (position) {
        const {
          start: { line, column },
        } = position;
        return `${label} (${line + offset}:${column})`;
      }
      return label;
    };

    if (invalid.length > 0) {
      report.push(
        "#### Invalid AST transformations",
        ...invalid
          .filter(({ source }) => !!source)
          .map(({ source, targetType, unexpectedChildren }: any) =>
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
}

function buildLocaleMap(locale) {
  let localesMap = new Map();
  if (locale !== "all") {
    localesMap = new Map([[locale.toLowerCase(), locale]]);
  }
  return localesMap;
}

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
  .option("--print-ast", "Prints MD AST", {
    default: false,
    validator: program.BOOLEAN,
  })
  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: (Array.from(VALID_LOCALES.values()) as string[]).concat("all"),
  })
  .option("--prepare-spec-url-files", "Prepare files with spec URLs", {
    default: false,
    validator: program.BOOLEAN,
  })
  .option("--add-spec-urls", "Adds spec URLs", {
    default: false,
    validator: program.BOOLEAN,
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      console.log(
        `Starting HTML to Markdown conversion in ${options.mode} mode`
      );
      const documents = Document.findAll({
        folderSearch: args.folder,
        locales: buildLocaleMap(options.locale),
      });

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
          if (
            doc.isMarkdown ||
            // findAll's folderSearch is fuzzy which we don't want here
            !doc.metadata.slug
              .toLowerCase()
              .startsWith(args.folder.toLowerCase())
          ) {
            continue;
          }
          if (options.verbose) {
            console.log(doc.metadata.slug);
          }
          let { body: h, attributes: metadata } = fm(doc.rawContent);
          const specURLs = [];
          if (options.addSpecUrls || options.prepareSpecUrlFiles) {
            const $ = cheerio.load(doc.rawBody);
            const specTable = $("h2:contains('Specifications') + table");
            const tableCells = $("h2:contains('Specifications') + table td");
            for (const td of tableCells) {
              if (td.children[0]) {
                const tdData = td.children[0].data;
                // Look for <td>{{...}}</td> in any Specifications table.
                if (
                  typeof tdData === "string" &&
                  tdData.trim().match(/^{{.+}}$/)
                ) {
                  const [result] =
                    // Render (resolve/expand) any {{..}} macro found.
                    await render(tdData, { slug: "", locale: "en-US" });
                  const $ = cheerio.load(result);
                  // {{...}} macros that are spec references expand into
                  // <a href="https://...">...</a> elements
                  if ($("a")[0]) {
                    let href = $("a")[0].attribs.href;
                    href = href
                      .replace(
                        "www.w3.org/TR/wai-aria-1.1",
                        "w3c.github.io/aria"
                      )
                      .replace(
                        "www.w3.org/TR/wai-aria-practices-1.2",
                        "w3c.github.io/aria-practices"
                      )
                      .replace(
                        "www.w3.org/TR/WebCryptoAPI",
                        "w3c.github.io/webcrypto"
                      )
                      .replace(
                        "heycam.github.io/webidl",
                        "webidl.spec.whatwg.org"
                      )
                      .replace(
                        "wicg.github.io/InputDeviceCapabilities",
                        "wicg.github.io/input-device-capabilities"
                      )
                      .replace(
                        "wicg.github.io/web-locks",
                        "w3c.github.io/web-locks"
                      );
                    if (href && href.match("http[s]?://")) {
                      if (options.verbose) {
                        const spec = specs.find(
                          (spec: any) =>
                            href.startsWith(spec.url) ||
                            href.startsWith(spec.nightly.url) ||
                            href.startsWith(spec.series.nightlyUrl)
                        );
                        const specificationsData = {
                          bcdSpecificationURL: href,
                          title: "Unknown specification",
                        };
                        if (spec) {
                          specificationsData.title = spec.title;
                        }
                        if (
                          specificationsData.title === "Unknown specification"
                        ) {
                          const specList = web.getJSONData("SpecData");
                          if (
                            Object.keys(specList).find(
                              (key) =>
                                specList[key]["url"] === href.split("#")[0]
                            )
                          ) {
                            console.log(
                              chalk.red(
                                "⚠️  spec url not in browser-specs (but in SpecData): " +
                                  href
                              )
                            );
                          } else {
                            console.log(
                              chalk.redBright(
                                "❌ spec url from unknown spec: " + href
                              )
                            );
                          }
                        } else {
                          console.log(chalk.green("✅ spec url: " + href));
                        }
                      }
                      specURLs.push(href);
                    }
                  }
                }
              }
            }
            let {} = ({ body: h, attributes: metadata } = fm(doc.rawContent));
            if (specURLs.length !== 0) {
              if (options.addSpecUrls) {
                // Only if the --add-spec-urls option (not the
                // --prepare-spec-url-files option) was specified do we
                // replace Specifications tables with {{Specifications}}
                // macros, and add the spec-url frontmatter key.
                const p = $("<p>{{Specifications}}</p>");
                specTable.replaceWith(p);
                h = $.html();
                if (metadata["browser-compat"]) {
                  console.log(
                    chalk.red(
                      "⚠️  browser-compat frontmatter key found;" +
                        " not adding spec-urls"
                    )
                  );
                } else {
                  metadata["spec-urls"] =
                    // String, if only on spec URL; otherwise, array.
                    specURLs.length === 1 ? specURLs[0] : specURLs;
                }
              }
            } else {
              // --add-spec-urls or --prepare-spec-url-files was specified
              // but because specURLs.length is zero, that means the
              // current document we’re processing has no spec URLs, so
              // skip it (don’t write any output for it), and move on to
              // checking for spec URLs in the next document.
              continue;
            }
          }
          const [markdown, { invalid, unhandled }] = await h2m(h, {
            printAST: options.printAst,
            locale: doc.metadata.locale,
          });

          if (invalid.length > 0 || unhandled.length > 0) {
            problems.set(doc.url, {
              offset: doc.fileInfo.frontMatterOffset,
              invalid,
              unhandled,
            });
          }

          if (options.mode == "replace" || options.mode == "keep") {
            if (options.mode == "replace") {
              const gitRoot = getRoot(options.locale);
              execGit(
                [
                  "mv",
                  doc.fileInfo.path,
                  doc.fileInfo.path.replace(/\.html$/, ".md"),
                ],
                {},
                gitRoot
              );
            }
            saveFile(
              doc.fileInfo.path.replace(/\.html$/, ".md"),
              markdown,
              metadata
            );
          }
        }
      } finally {
        progressBar.stop();
      }

      saveProblemsReport(problems);
    })
  )

  .command("m2h", "Convert Markdown to HTML")
  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: (Array.from(VALID_LOCALES.values()) as string[]).concat("all"),
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      const all = Document.findAll({
        folderSearch: args.folder,
        locales: buildLocaleMap(options.locale),
      });
      for (let doc of all.iter()) {
        if (!doc.isMarkdown) {
          continue;
        }
        const { body: m, attributes: metadata } = fm(doc.rawContent);
        const h = await m2h(m, { locale: doc.metadata.locale });
        saveFile(doc.fileInfo.path.replace(/\.md$/, ".html"), h, metadata);
      }
    })
  );

program.run();
