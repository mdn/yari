#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fdir, PathsOutput } from "fdir";
import frontmatter from "front-matter";
import caporal from "@caporal/core";
import chalk from "chalk";
import cliProgress from "cli-progress";
import inquirer from "inquirer";
import openEditor from "open-editor";
import open from "open";
import log from "loglevel";
import { Action, ActionParameters, Logger } from "types";

import {
  DEFAULT_LOCALE,
  VALID_LOCALES,
  VALID_FLAW_CHECKS,
} from "../libs/constants/index.js";
import { Redirect, Document, buildURL, getRoot } from "../content/index.js";
import { buildDocument, gatherGitHistory, buildSPAs } from "../build/index.js";
import { isValidLocale } from "../libs/locale-utils/index.js";
import type { Doc } from "../libs/types/document.js";
import {
  ALWAYS_ALLOW_ROBOTS,
  BUILD_OUT_ROOT,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  GOOGLE_ANALYTICS_ACCOUNT,
  GOOGLE_ANALYTICS_DEBUG,
} from "../libs/env/index.js";
import { runMakePopularitiesFile } from "./popularities.js";
import { runOptimizeClientBuild } from "./optimize-client-build.js";
import { runBuildRobotsTxt } from "./build-robots-txt.js";
import { syncAllTranslatedContent } from "./sync-translated-content.js";
import { macroUsageReport } from "./macro-usage-report.js";
import * as kumascript from "../kumascript/index.js";
import {
  MacroInvocationError,
  MacroRedirectedLinkError,
} from "../kumascript/src/errors.js";
import { whatsdeployed } from "./whatsdeployed.js";

const { program } = caporal;
const { prompt } = inquirer;

const PORT = parseInt(process.env.SERVER_PORT || "5042");

// The Google Analytics pageviews CSV file parsed, sorted (most pageviews
// first), and sliced to this number of URIs that goes into the JSON file.
// If this number is too large the resulting JSON file gets too big and
// will include very rarely used URIs.
const MAX_GOOGLE_ANALYTICS_URIS = 20000;

interface ValidateRedirectsActionParameters extends ActionParameters {
  args: {
    locales: string[];
  };
  options: {
    strict: boolean;
  };
}
interface TestRedirectsActionParameters extends ActionParameters {
  args: {
    urls: string[];
  };
}
interface AddRedirectActionParameters extends ActionParameters {
  args: {
    from: string;
    to: string;
  };
}
interface FixRedirectsActionParameters extends ActionParameters {
  args: {
    locales: string[];
  };
}

interface DeleteActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
  options: {
    recursive: boolean;
    redirect?: string;
    yes: boolean;
  };
}

interface MoveActionParameters extends ActionParameters {
  args: {
    oldSlug: string;
    newSlug: string;
    locale: string;
  };
  options: {
    yes: boolean;
  };
}

interface CreateActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}

interface EditActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}
interface ValidateActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
}

interface PreviewActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
  options: {
    hostname: string;
    port: string;
  };
}

interface GatherGitHistoryActionParameters extends ActionParameters {
  options: {
    saveHistory: string;
    loadHistory: string;
    verbose: boolean;
  };
}

interface SyncTranslatedContentActionParameters extends ActionParameters {
  args: {
    locales: string[];
  };
  options: {
    verbose: boolean;
  };
}

interface FixFlawsActionParameters extends ActionParameters {
  args: {
    fixFlawsTypes: string[];
  };
  options: {
    locale: string;
    fileTypes: string[];
  };
}

interface FlawsActionParameters extends ActionParameters {
  args: {
    slug: string;
    locale: string;
  };
  options: {
    yes: boolean;
  };
}

interface PopularitiesActionParameters extends ActionParameters {
  options: {
    outfile: string;
    maxUris: number;
    refresh: boolean;
  };
  logger: Logger;
}

interface GoogleAnalyticsCodeActionParameters extends ActionParameters {
  options: {
    account: string;
    debug: boolean;
    outfile: string;
  };
}

interface BuildRobotsTxtActionParameters extends ActionParameters {
  options: {
    outfile: string;
    maxUris: number;
    refresh: boolean;
  };
  logger: Logger;
}

interface MacrosActionParameters extends ActionParameters {
  args: {
    cmd: string;
    foldersearch: string;
    macros: string[];
  };
}

interface OptimizeClientBuildActionParameters extends ActionParameters {
  args: {
    buildroot: string;
  };
}

interface MacroUsageReportActionParameters extends ActionParameters {
  options: {
    deprecatedOnly: boolean;
    format: "md-table" | "json";
    unusedOnly: boolean;
  };
}

interface WhatsdeployedActionParameters extends ActionParameters {
  args: {
    directory: string;
  };
  options: {
    output: string;
    dryRun: boolean;
  };
}

function tryOrExit<T extends ActionParameters>(
  f: ({ options, ...args }: T) => unknown
): Action {
  return async ({ options = {}, ...args }: ActionParameters) => {
    try {
      await f({ options, ...args } as T);
    } catch (e) {
      const error = e as Error;
      if (
        options.verbose ||
        options.v ||
        (error instanceof Error && !error.message)
      ) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}

program
  .bin("yarn tool")
  .name("tool")
  .version("0.0.0")
  .disableGlobalOption("--silent")
  .cast(false)
  .command("validate-redirects", "Try loading the _redirects.txt file(s)")
  .argument("[locales...]", "Locale", {
    default: [...VALID_LOCALES.keys()],
    validator: [...VALID_LOCALES.keys()],
  })
  .option("--strict", "Strict validation")
  .action(
    tryOrExit(
      ({ args, options, logger }: ValidateRedirectsActionParameters) => {
        const { locales } = args;
        const { strict } = options;
        if (strict) {
          for (const locale of locales) {
            try {
              Redirect.validateLocale(locale, strict);
              logger.info(
                chalk.green(`✓ redirects for ${locale} looking good!`)
              );
            } catch (e) {
              throw new Error(
                `_redirects.txt for ${locale} is causing issues: ${e}`
              );
            }
          }
        } else {
          try {
            Redirect.load(locales, true);
          } catch (e) {
            throw new Error(`Unable to load redirects: ${e}`);
          }
        }

        logger.info(chalk.green("🍾 All is well in the world of redirects 🥂"));
      }
    )
  )

  .command("test-redirects", "Test URLs (pathnames) to see if they redirect")
  .argument("[urls...]", "URLs to test")
  .action(
    tryOrExit(({ args, logger }: TestRedirectsActionParameters) => {
      for (const url of args.urls) {
        const resolved = Redirect.resolve(url);
        if (resolved === url) {
          logger.info(chalk.yellow(`${url.padEnd(50)} Not a redirecting URL`));
        } else {
          logger.info(chalk.green(`${url.padEnd(50)} -> ${resolved}`));
        }
      }
    })
  )

  .command("add-redirect", "Add a new redirect")
  .argument("<from>", "From-URL")
  .argument("<to>", "To-URL")
  .action(
    tryOrExit(({ args, logger }: AddRedirectActionParameters) => {
      const from = new URL(args.from).pathname;
      const to = new URL(args.to).pathname;
      const locale = from.split("/")[1];
      Redirect.add(locale, [[from, to]]);
      logger.info(chalk.green(`Saved '${from}' → '${to}'`));
    })
  )

  .command("fix-redirects", "Consolidate/fix redirects")
  .argument("<locales...>", "Locale", {
    default: [DEFAULT_LOCALE],
    validator: [...VALID_LOCALES.values(), ...VALID_LOCALES.keys()],
  })
  .action(
    tryOrExit(({ args, logger }: FixRedirectsActionParameters) => {
      for (const locale of args.locales) {
        Redirect.add(locale.toLowerCase(), [], { fix: true, strict: true });
        logger.info(chalk.green(`Fixed ${locale}`));
      }
    })
  )

  .command("delete", "Delete content")
  .argument("<slug>", "Slug")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .option("-r, --recursive", "Delete content recursively", { default: false })
  .option(
    "--redirect <redirect>",
    "Redirect document (and its children, if --recursive is true) to the URL <redirect>"
  )
  .option("-y, --yes", "Assume yes", { default: false })
  .action(
    tryOrExit(async ({ args, options }: DeleteActionParameters) => {
      const { slug, locale } = args;
      const { recursive, redirect, yes } = options;
      const changes = await Document.remove(slug, locale, {
        recursive,
        redirect,
        dry: true,
      });
      console.log(chalk.green(`Will delete ${changes.length} documents:`));
      console.log(chalk.red(changes.join("\n")));
      if (redirect) {
        console.log(
          chalk.green(
            `Redirecting ${
              recursive ? "each document" : "document"
            } to: ${redirect}`
          )
        );
      } else {
        console.error(
          chalk.yellow(
            "Deleting without a redirect. Consider using the --redirect option with a related page instead."
          )
        );
      }
      const { run } = yes
        ? { run: true }
        : await prompt({
            type: "confirm",
            message: "Proceed?",
            name: "run",
            default: true,
          });
      if (run) {
        const deletedDocs = await Document.remove(slug, locale, {
          recursive,
          redirect,
        });
        console.log(chalk.green(`Deleted ${deletedDocs.length} documents.`));

        // find references to the deleted document in content
        console.log("Checking references...");
        const referringFiles = [];
        const allDocs = await Document.findAll();
        for (const document of allDocs.iterDocs()) {
          const rawBody = document.rawBody;
          for (const deleted of deletedDocs) {
            const url = `/${locale}/docs/${deleted}`;
            if (rawBody.includes(url)) {
              referringFiles.push(`${document.url}`);
            }
          }
        }

        if (referringFiles.length) {
          console.warn(
            chalk.yellow(
              `\n${referringFiles.length} files are referring to the deleted document. ` +
                `Please update the following files to remove the links:\n\t${referringFiles.join(
                  "\n\t"
                )}`
            )
          );
        } else {
          console.log(
            chalk.green("\nNo file is referring to the deleted document.")
          );
        }
      }
    })
  )

  .command("move", "Move content to a new slug")
  .argument("<oldSlug>", "Old slug")
  .argument("<newSlug>", "New slug", {
    validator: (value) => {
      if (typeof value === "string" && value.includes("#")) {
        throw new Error("slug can not contain the '#' character");
      }
      return value;
    },
  })
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .option("-y, --yes", "Assume yes", { default: false })
  .action(
    tryOrExit(async ({ args, options }: MoveActionParameters) => {
      const { oldSlug, newSlug, locale } = args;
      const { yes } = options;
      const changes = await Document.move(oldSlug, newSlug, locale, {
        dry: true,
      });
      console.log(
        chalk.green(
          `Will move ${changes.length} documents from ${oldSlug} to ${newSlug} for ${locale}`
        )
      );
      console.log(
        changes
          .map(([from, to]) => `${chalk.red(from)} → ${chalk.green(to)}`)
          .join("\n")
      );
      const { run } = yes
        ? { run: true }
        : await prompt({
            type: "confirm",
            message: "Proceed?",
            name: "run",
            default: true,
          });
      if (run) {
        const moved = await Document.move(oldSlug, newSlug, locale);
        console.log(chalk.green(`Moved ${moved.length} documents.`));
      }
    })
  )

  .command("edit", "Spawn your EDITOR for an existing slug")
  .argument("<slug>", "Slug of the document in question")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .action(
    tryOrExit(({ args }: EditActionParameters) => {
      const { slug, locale } = args;
      if (!Document.exists(slug, locale)) {
        throw new Error(`${slug} does not exists for ${locale}`);
      }
      const filePath = Document.fileForSlug(slug, locale);
      openEditor([filePath]);
    })
  )

  .command("create", "Spawn your Editor for a new slug")
  .argument("<slug>", "Slug of the document in question")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .action(
    tryOrExit(({ args }: CreateActionParameters) => {
      const { slug, locale } = args;
      const parentSlug = Document.parentSlug(slug);
      if (!Document.exists(parentSlug, locale)) {
        throw new Error(`Parent ${parentSlug} does not exists for ${locale}`);
      }
      if (Document.exists(slug, locale)) {
        throw new Error(`${slug} already exists for ${locale}`);
      }
      const filePath = Document.fileForSlug(slug, locale);
      fs.mkdirSync(path.basename(filePath), { recursive: true });
      openEditor([filePath]);
    })
  )

  .command("validate", "Validate a document")
  .argument("<slug>", "Slug of the document in question")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .action(
    tryOrExit(async ({ args }: ValidateActionParameters) => {
      const { slug, locale } = args;
      let okay = true;
      const document = Document.findByURL(buildURL(locale, slug));
      if (!document) {
        throw new Error(`Slug ${slug} does not exist for ${locale}`);
      }
      const { doc }: { doc: Doc } = await buildDocument(document);

      const flaws = Object.values(doc.flaws || {})
        .map((a) => a.length || 0)
        .reduce((a, b) => a + b, 0);
      if (flaws > 0) {
        console.log(chalk.red(`Found ${flaws} flaws.`));
        okay = false;
      }
      try {
        Document.validate(slug, locale);
      } catch (e) {
        console.log(chalk.red(e));
        okay = false;
      }
      if (okay) {
        console.log(chalk.green("✓ All seems fine"));
      }
    })
  )

  .command("preview", "Open a preview of a slug")
  .option("-p, --port <port>", "Port for your localhost hostname", {
    default: PORT,
  })
  .option("-h, --hostname <hostname>", "Hostname for your local server", {
    default: "localhost",
  })
  .argument("<slug>", "Slug (or path) of the document in question")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .action(
    tryOrExit(async ({ args, options }: PreviewActionParameters) => {
      const { slug, locale } = args;
      const { hostname, port } = options;
      let url: string;
      // Perhaps they typed in a path relative to the content root
      if (
        (slug.startsWith("files") || fs.existsSync(slug)) &&
        (slug.endsWith("index.html") || slug.endsWith("index.md"))
      ) {
        if (
          fs.existsSync(slug) &&
          slug.includes("translated-content") &&
          !CONTENT_TRANSLATED_ROOT
        ) {
          // Such an easy mistake to make that you pass it a file path
          // that comes from the translated-content repo but forgot to
          // set the environment variable first.
          console.warn(
            chalk.yellow(
              `Did you forget to set the environment variable ${chalk.bold(
                "CONTENT_TRANSLATED_ROOT"
              )}?`
            )
          );
        }
        const slugSplit = slug
          .replace(CONTENT_ROOT, "")
          .replace(CONTENT_TRANSLATED_ROOT ? CONTENT_TRANSLATED_ROOT : "", "")
          .split(path.sep);
        const document = Document.read(
          // Remove that leading 'files' and the trailing 'index.(html|md)'
          slugSplit.slice(1, -1).join(path.sep)
        );
        if (document) {
          url = document.url;
        }
      } else if (
        slug.includes(BUILD_OUT_ROOT) &&
        fs.existsSync(slug) &&
        fs.existsSync(path.join(slug, "index.json"))
      ) {
        // Someone probably yarn `yarn build` and copy-n-pasted one of the lines
        // it spits out from its CLI.
        const { doc } = JSON.parse(
          fs.readFileSync(path.join(slug, "index.json"), "utf-8")
        );
        if (doc) {
          url = doc.mdn_url;
        }
      } else {
        try {
          const parsed = new URL(slug);
          url = parsed.pathname + parsed.hash;
        } catch (err) {
          // If the `new URL()` constructor fails, it's probably not a URL
        }
        if (!url) {
          url = buildURL(locale, slug);
        }
      }

      if (!url) {
        throw new Error(`Unable to turn '${slug}' into an absolute URL`);
      }
      const absoluteURL = `http://${hostname}:${port}${url}`;
      await open(absoluteURL);
    })
  )

  .command(
    "gather-git-history",
    "Extract all last-modified dates from the git logs"
  )
  .option("--save-history <path>", "File to save all previous history")
  .option("--load-history <path>", "Optional file to load all previous history")
  .action(
    tryOrExit(async ({ options }: GatherGitHistoryActionParameters) => {
      const { saveHistory, loadHistory, verbose } = options;
      if (loadHistory) {
        if (fs.existsSync(loadHistory)) {
          console.log(
            chalk.yellow(`Reusing existing history from ${loadHistory}`)
          );
        }
      }
      const roots = [CONTENT_ROOT];
      if (CONTENT_TRANSLATED_ROOT) {
        roots.push(CONTENT_TRANSLATED_ROOT);
      }
      const map = gatherGitHistory(
        roots,
        loadHistory && fs.existsSync(loadHistory) ? loadHistory : null
      );
      const historyPerLocale = {};

      // Someplace to put the map into an object so it can be saved into `saveHistory`
      const allHistory = {};
      for (const [relPath, value] of map) {
        const locale = relPath.split(path.sep)[0];
        if (!isValidLocale(locale)) {
          continue;
        }
        allHistory[relPath] = value;
        if (!historyPerLocale[locale]) {
          historyPerLocale[locale] = {};
        }
        historyPerLocale[locale][relPath] = value;
      }
      let filesWritten = 0;
      for (const [locale, history] of Object.entries(historyPerLocale)) {
        const root = getRoot(locale);
        const outputFile = path.join(root, locale, "_githistory.json");
        fs.writeFileSync(outputFile, JSON.stringify(history, null, 2), "utf-8");
        filesWritten += 1;
        if (verbose) {
          console.log(
            chalk.green(
              `Wrote '${locale}' ${Object.keys(
                history
              ).length.toLocaleString()} paths into ${outputFile}`
            )
          );
        }
      }
      console.log(chalk.green(`Wrote ${filesWritten} _githistory.json files`));
      if (saveHistory) {
        fs.writeFileSync(
          saveHistory,
          JSON.stringify(allHistory, null, 2),
          "utf-8"
        );
        console.log(
          chalk.green(
            `Saved ${Object.keys(
              allHistory
            ).length.toLocaleString()} paths into ${saveHistory}`
          )
        );
      }
    })
  )

  .command(
    "sync-translated-content",
    "Sync translated content (sync with en-US slugs) for a locale"
  )
  .argument("<locales...>", "Locale", {
    default: [...VALID_LOCALES.keys()].filter((l) => l !== "en-us"),
    validator: [...VALID_LOCALES.keys()].filter((l) => l !== "en-us"),
  })
  .action(
    tryOrExit(
      async ({ args, options }: SyncTranslatedContentActionParameters) => {
        const { locales } = args;
        const { verbose } = options;
        if (verbose) {
          log.setDefaultLevel(log.levels.DEBUG);
        }
        for (const locale of locales) {
          const {
            movedDocs,
            conflictingDocs,
            orphanedDocs,
            redirectedDocs,
            renamedDocs,
            totalDocs,
          } = await syncAllTranslatedContent(locale);
          console.log(chalk.green(`Syncing ${locale}:`));
          console.log(chalk.green(`Total of ${totalDocs} documents`));
          console.log(chalk.green(`Moved ${movedDocs} documents`));
          console.log(chalk.green(`Renamed ${renamedDocs} documents`));
          console.log(chalk.green(`Conflicting ${conflictingDocs} documents.`));
          console.log(chalk.green(`Orphaned ${orphanedDocs} documents.`));
          console.log(
            chalk.green(`Fixed ${redirectedDocs} redirected documents.`)
          );
        }
      }
    )
  )

  .command("fix-flaws", "Fix all flaws")
  .option("-l, --locale <locale>", "locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .option("--file-types <fileTypes...>", "File types to fix flaws in", {
    default: ["md"],
    validator: ["md", "html"],
  })
  .argument("<fix-flaws-types...>", "flaw types", {
    default: ["broken_links"],
    validator: [...VALID_FLAW_CHECKS],
  })
  .action(
    tryOrExit(async ({ args, options }: FixFlawsActionParameters) => {
      const { fixFlawsTypes } = args;
      const { locale, fileTypes } = options;
      const allDocs = await Document.findAll({
        locales: new Map([[locale.toLowerCase(), true]]),
      });
      const progressBar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_grey
      );
      progressBar.start(allDocs.count, 0);

      for (const document of allDocs.iterDocs()) {
        try {
          if (fileTypes.includes(document.isMarkdown ? "md" : "html")) {
            await buildDocument(document, {
              fixFlaws: true,
              fixFlawsTypes: new Set(fixFlawsTypes),
              fixFlawsVerbose: true,
            });
          }
        } catch (e) {
          console.error(e);
        }
        progressBar.increment();
      }

      progressBar.stop();
    })
  )

  .command("flaws", "Find (and fix) flaws in a document")
  .argument("<slug>", "Slug of the document in question")
  .argument("[locale]", "Locale", {
    default: DEFAULT_LOCALE,
    validator: [...VALID_LOCALES.values()],
  })
  .option("-y, --yes", "Assume yes", { default: false })
  .action(
    tryOrExit(async ({ args, options }: FlawsActionParameters) => {
      const { slug, locale } = args;
      const { yes } = options;
      const document = Document.findByURL(buildURL(locale, slug));
      if (!document) {
        throw new Error(`Slug ${slug} does not exist for ${locale}`);
      }
      const { doc }: { doc: Doc } = await buildDocument(document, {
        fixFlaws: true,
        fixFlawsDryRun: true,
      });

      const flaws = Object.values(doc.flaws || {})
        .map((a) => a.filter((f) => f.fixable).length || 0)
        .reduce((a, b) => a + b, 0);
      if (flaws === 0) {
        console.log(chalk.green("Found no fixable flaws!"));
        return;
      }
      const { run } = yes
        ? { run: true }
        : await prompt({
            type: "confirm",
            message: `Proceed fixing ${flaws} flaws?`,
            name: "run",
            default: true,
          });
      if (run) {
        buildDocument(document, { fixFlaws: true, fixFlawsVerbose: true });
      }
    })
  )

  .command("redundant-translations", "Find redundant translations")
  .action(
    tryOrExit(async () => {
      if (!CONTENT_TRANSLATED_ROOT) {
        throw new Error("CONTENT_TRANSLATED_ROOT not set");
      }
      if (!fs.existsSync(CONTENT_TRANSLATED_ROOT)) {
        throw new Error(`${CONTENT_TRANSLATED_ROOT} does not exist`);
      }
      const documents = await Document.findAll();
      if (!documents.count) {
        throw new Error("No documents to analyze");
      }
      // Build up a map of translations by their `translation_of`
      const map = new Map();
      for (const document of documents.iterDocs()) {
        if (!document.isTranslated) continue;
        const { translation_of, locale } = document.metadata;
        if (!map.has(translation_of)) {
          map.set(translation_of, new Map());
        }
        if (!map.get(translation_of).has(locale)) {
          map.get(translation_of).set(locale, []);
        }
        map
          .get(translation_of)
          .get(locale)
          .push(
            Object.assign(
              { filePath: document.fileInfo.path },
              document.metadata
            )
          );
      }
      // Now, let's investigate those with more than 1
      let sumENUS = 0;
      let sumTotal = 0;
      for (const [translation_of, localeMap] of map) {
        for (const [, metadatas] of localeMap) {
          if (metadatas.length > 1) {
            // console.log(translation_of, locale, metadatas);
            sumENUS++;
            sumTotal += metadatas.length;
            console.log(
              `https://developer.allizom.org/en-US/docs/${translation_of}`
            );
            for (const metadata of metadatas) {
              console.log(metadata);
            }
          }
        }
      }
      console.warn(
        `${sumENUS} en-US documents have multiple translations with the same locale`
      );
      console.log(
        `In total, ${sumTotal} translations that share the same translation_of`
      );
    })
  )

  .command(
    "popularities",
    "Convert an AWS Athena log aggregation CSV into a popularities.json file"
  )
  .option("--outfile <path>", "output file", {
    default: fileURLToPath(new URL("../popularities.json", import.meta.url)),
  })
  .option("--max-uris <number>", "limit to top <number> entries", {
    default: MAX_GOOGLE_ANALYTICS_URIS,
  })
  .option("--refresh", "download again even if exists", {
    default: false,
  })
  .action(
    tryOrExit(async ({ options, logger }: PopularitiesActionParameters) => {
      const { refresh, outfile } = options;
      if (!refresh && fs.existsSync(outfile)) {
        const stat = fs.statSync(outfile);
        logger.info(
          chalk.yellow(
            `Reusing exising ${outfile} (${stat.mtime}) for popularities.`
          )
        );
        logger.info(
          `Reset ${outfile} by running: yarn tool popularities --refresh`
        );
        return;
      }
      const { rowCount, popularities, pageviews } =
        await runMakePopularitiesFile(options);
      logger.info(chalk.green(`Parsed ${rowCount.toLocaleString()} rows.`));

      const numberKeys = Object.keys(popularities).length;
      logger.info(
        chalk.green(`Wrote ${numberKeys.toLocaleString()} pages' popularities.`)
      );

      logger.debug("25 most popular URIs...");
      pageviews.slice(0, 25).forEach(([uri, popularity], i) => {
        logger.debug(
          `${`${i}`.padEnd(2)} ${uri.padEnd(75)} ${popularity.toFixed(5)}`
        );
      });
      function fmtBytes(bytes) {
        return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
      }
      logger.info(
        chalk.green(
          `${options.outfile} is ${fmtBytes(fs.statSync(options.outfile).size)}`
        )
      );
    })
  )

  .command(
    "google-analytics-code",
    "Generate a .js file that can be used in SSR rendering"
  )
  .option("--outfile <path>", "name of the generated script file", {
    default: path.join(BUILD_OUT_ROOT, "static", "js", "ga.js"),
  })
  .option(
    "--debug",
    "whether to use the Google Analytics debug file (defaults to value of $GOOGLE_ANALYTICS_DEBUG)",
    {
      default: GOOGLE_ANALYTICS_DEBUG,
    }
  )
  .option(
    "--account <id>",
    "Google Analytics account ID (defaults to value of $GOOGLE_ANALYTICS_ACCOUNT)",
    {
      default: GOOGLE_ANALYTICS_ACCOUNT,
    }
  )
  .action(
    tryOrExit(
      async ({ options, logger }: GoogleAnalyticsCodeActionParameters) => {
        const { outfile, debug, account } = options;
        if (account) {
          const dntHelperCode = fs
            .readFileSync(
              new URL("mozilla.dnthelper.min.js", import.meta.url),
              "utf-8"
            )
            .trim();

          const gaScriptURL = `https://www.google-analytics.com/${
            debug ? "analytics_debug" : "analytics"
          }.js`;

          const code = `
// Mozilla DNT Helper
${dntHelperCode}
// only load GA if DNT is not enabled
if (Mozilla && !Mozilla.dntEnabled()) {
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', '${account}', 'mozilla.org');
    ga('set', 'anonymizeIp', true);
    ga('send', 'pageview');

    var gaScript = document.createElement('script');
    gaScript.async = 1; gaScript.src = '${gaScriptURL}';
    document.head.appendChild(gaScript);
}`.trim();
          fs.writeFileSync(outfile, `${code}\n`, "utf-8");
          logger.info(
            chalk.green(
              `Generated ${outfile} for SSR rendering using ${account}${
                debug ? " (debug mode)" : ""
              }.`
            )
          );
        } else {
          logger.info(chalk.yellow("No Google Analytics code file generated"));
        }
      }
    )
  )

  .command(
    "build-robots-txt",
    "Generate a robots.txt in the build root depending ALWAYS_ALLOW_ROBOTS"
  )
  .option("--outfile <path>", "name of the generated file", {
    default: path.join(BUILD_OUT_ROOT, "robots.txt"),
  })
  .action(
    tryOrExit(async ({ options, logger }: BuildRobotsTxtActionParameters) => {
      const { outfile } = options;
      await runBuildRobotsTxt(outfile);
      logger.info(
        chalk.yellow(
          `Generated ${path.relative(
            ".",
            outfile
          )} based on ALWAYS_ALLOW_ROBOTS=${ALWAYS_ALLOW_ROBOTS}`
        )
      );
    })
  )

  .command("spas", "Build (SSR) all the skeleton apps for single page apps")
  .action(
    tryOrExit(async ({ options }) => {
      await buildSPAs(options);
    })
  )

  .command(
    "macros",
    "Render and/or remove one or more macros from one or more documents"
  )
  .option("-f, --force", "Render even if there are non-fixable flaws", {
    default: false,
  })
  .argument("<cmd>", 'must be either "render" or "remove"')
  .argument("<foldersearch>", "folder of documents to target")
  .argument("<macros...>", "one or more macro names")
  .action(
    tryOrExit(async ({ args, options }: MacrosActionParameters) => {
      if (!CONTENT_ROOT) {
        throw new Error("CONTENT_ROOT not set");
      }
      if (!CONTENT_TRANSLATED_ROOT) {
        throw new Error("CONTENT_TRANSLATED_ROOT not set");
      }
      const { force } = options;
      const { cmd, foldersearch, macros } = args;
      const cmdLC = cmd.toLowerCase();
      if (!["render", "remove"].includes(cmdLC)) {
        throw new Error(`invalid macros command "${cmd}"`);
      }
      console.log(
        `${cmdLC} the macro(s) ${macros
          .map((m) => `"${m}"`)
          .join(", ")} within content folder(s) matching "${foldersearch}"`
      );
      const documents = await Document.findAll({
        folderSearch: foldersearch,
      });
      if (!documents.count) {
        throw new Error("no documents found");
      }

      async function renderOrRemoveMacros(document) {
        try {
          return await kumascript.render(document.url, {
            invalidateCache: true,
            selective_mode: [cmdLC, macros],
          });
        } catch (error) {
          if (error instanceof MacroInvocationError) {
            error.updateFileInfo(document.fileInfo);
            throw new Error(
              `error trying to parse ${error.filepath}, line ${error.line} column ${error.column} (${error.error.message})`
            );
          }

          throw error;
        }
      }

      let countTotal = 0;
      let countSkipped = 0;
      let countModified = 0;
      let countNoChange = 0;
      for (const document of documents.iterDocs()) {
        countTotal++;
        console.group(`${document.fileInfo.path}:`);
        const originalRawBody = document.rawBody;
        let [$, flaws] = await renderOrRemoveMacros(document);
        if (flaws.length) {
          const fixableFlaws = flaws.filter(
            (f): f is MacroRedirectedLinkError =>
              Object.prototype.hasOwnProperty.call(f, "redirectInfo")
          );
          const nonFixableFlaws = flaws.filter(
            (f) => !Object.prototype.hasOwnProperty.call(f, "redirectInfo")
          );
          const nonFixableFlawNames = [
            ...new Set(nonFixableFlaws.map((f) => f.name)).values(),
          ].join(", ");
          if (force || nonFixableFlaws.length === 0) {
            // They're all fixable or we don't care if some or all are
            // not, but let's at least fix any that we can.
            if (nonFixableFlaws.length > 0) {
              console.log(
                `ignoring ${nonFixableFlaws.length} non-fixable flaw(s) (${nonFixableFlawNames})`
              );
            }
            if (fixableFlaws.length) {
              console.group(
                `fixing ${fixableFlaws.length} fixable flaw(s) before proceeding:`
              );
              // Let's start fresh so we don't keep the "data-flaw-src"
              // attributes that may have been injected during the rendering.
              document.rawBody = originalRawBody;
              for (const flaw of fixableFlaws) {
                const suggestion = flaw.macroSource.replace(
                  flaw.redirectInfo.current,
                  flaw.redirectInfo.suggested
                );
                document.rawBody = document.rawBody.replace(
                  flaw.macroSource,
                  suggestion
                );
                console.log(`${flaw.macroSource} --> ${suggestion}`);
              }
              console.groupEnd();
              await Document.update(
                document.url,
                document.rawBody,
                document.metadata
              );
              // Ok, we've fixed the fixable flaws, now let's render again.
              [$, flaws] = await renderOrRemoveMacros(document);
            }
          } else {
            // There are one or more flaws that we can't fix, and we're not
            // going to ignore them, so let's skip this document.
            console.log(
              `skipping, has ${nonFixableFlaws.length} non-fixable flaw(s) (${nonFixableFlawNames})`
            );
            console.groupEnd();
            countSkipped++;
            continue;
          }
        }
        const newRawHTML = $("body").html();
        if (newRawHTML !== originalRawBody) {
          await Document.update(document.url, newRawHTML, document.metadata);
          console.log(`modified`);
          countModified++;
        } else {
          console.log(`no change`);
          countNoChange++;
        }
        console.groupEnd();
      }
      console.log(
        `modified: ${countModified} | no-change: ${countNoChange} | skipped: ${countSkipped} | total: ${countTotal}`
      );
    })
  )

  .command("inventory", "Create content inventory as JSON")
  .help(
    "In order to run the command, ensure that you have CONTENT_ROOT set in your .env file. For example: CONTENT_ROOT=/Users/steve/mozilla/mdn-content/files"
  )
  .action(
    tryOrExit(async () => {
      if (!CONTENT_ROOT) {
        throw new Error(
          "CONTENT_ROOT not set. Please run yarn tool inventory --help for more information."
        );
      }

      const crawler = new fdir()
        .withFullPaths()
        .withErrors()
        .filter((filePath) => filePath.endsWith(".md"))
        .crawl(CONTENT_ROOT);
      const paths = (await crawler.withPromise()) as PathsOutput;

      const inventory = paths.map((path) => {
        const fileContents = fs.readFileSync(path, "utf-8");
        const parsed = frontmatter(fileContents);

        return {
          path: path.substring(path.indexOf("/files")),
          frontmatter: parsed.attributes,
        };
      });

      process.stdout.write(JSON.stringify(inventory, undefined, 2));
    })
  )

  .command(
    "optimize-client-build",
    "After the client code has been built there are things to do that react-scripts can't."
  )
  .argument("<buildroot>", "directory where react-scripts built", {
    default: path.join("client", "build"),
  })
  .action(
    tryOrExit(
      async ({
        args,
        options,
        logger,
      }: OptimizeClientBuildActionParameters) => {
        const { buildroot } = args;
        const { results } = await runOptimizeClientBuild(buildroot);
        if (options.verbose) {
          for (const result of results) {
            logger.info(`${result.filePath} -> ${result.hashedHref}`);
          }
        } else {
          logger.info(
            chalk.green(
              `Hashed ${results.length} files in ${path.join(
                buildroot,
                "index.html"
              )}`
            )
          );
        }
      }
    )
  )

  .command(
    "macro-usage-report",
    "Counts occurrences of each macro and prints it as a table."
  )
  .option("--deprecated-only", "Only reports deprecated macros.")
  .option("--format <type>", "Format of the report.", {
    default: "md-table",
    validator: ["json", "md-table"],
  })
  .option("--unused-only", "Only reports unused macros.")
  .action(
    tryOrExit(async ({ options }: MacroUsageReportActionParameters) => {
      const { deprecatedOnly, format, unusedOnly } = options;
      return macroUsageReport({ deprecatedOnly, format, unusedOnly });
    })
  )

  .command(
    "whatsdeployed",
    "Create a whatsdeployed.json file by asking git for the date and commit hash of HEAD."
  )
  .argument("<directory>", "Path in which to execute git", {
    default: process.cwd(),
  })
  .option("--output <output>", "Name of JSON file to create.", {
    default: "whatsdeployed.json",
  })
  .option("--dry-run", "Prints the result without writing the file")
  .action(
    tryOrExit(async ({ args, options }: WhatsdeployedActionParameters) => {
      const { directory } = args;
      const { output, dryRun } = options;
      return whatsdeployed(directory, output, dryRun);
    })
  );

program.run();
