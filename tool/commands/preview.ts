import fs from "node:fs";
import path from "node:path";

import type { ActionParameters, Program } from "@caporal/core";
import chalk from "chalk";

import { DEFAULT_LOCALE, VALID_LOCALES } from "../../libs/constants/index.js";
import { tryOrExit } from "../util.js";
import {
  BUILD_OUT_ROOT,
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
} from "../../libs/env/index.js";
import { Document, buildURL } from "../../content/index.js";

const PORT = parseInt(process.env.SERVER_PORT || "5042");

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

export function previewCommand(program: Program) {
  return program
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
    );
}
