import React from "react";
import fs from "fs";
import path from "path";
import url from "url";

// This is necessary because the cli.js is in dist/cli.js
// and we need to reach the .env this way.
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

import fetch from "node-fetch";
import sane from "sane";
import minimist from "minimist";
import buildOptions from "minimist-options";
import { ServerLocation } from "@reach/router";
import sourceMapSupport from "source-map-support";
import chalk from "chalk";

import { App } from "../client/src/app";
import render from "./render";
import { fixSyntaxHighlighting } from "./syntax-highlighter";
import { normalizeURLs } from "./browser-compatibility-table";

const STUMPTOWN_CONTENT_ROOT =
  process.env.STUMPTOWN_CONTENT_ROOT || path.join(__dirname, "../../stumptown");
const STATIC_ROOT = path.join(__dirname, "../../client/build");
const TOUCHFILE = path.join(__dirname, "../../client/src/touchthis.js");
const BUILD_JSON_SERVER =
  process.env.BUILD_JSON_SERVER || "http://localhost:5555";
sourceMapSupport.install();

/** In the document, there's related_content and it contains keys
 * called 'mdn_url'. We need to transform them to relative links
 * that works with our router.
 * This /mutates/ the document data.
 */
function fixRelatedContent(document) {
  function fixBlock(block) {
    if (block.content) {
      block.content.forEach(item => {
        if (item.mdn_url) {
          // always expect this to be a relative URL
          if (!item.mdn_url.startsWith("/")) {
            throw new Error(
              `Document's .mdn_url doesn't start with / (${item.mdn_url})`
            );
          }
          // Complicated way to rename an object key.
          item.uri = item.mdn_url;
          delete item.mdn_url;
        }
        // The sidebar only needs a 'title' and doesn't really care if
        // it came from the full title or the 'short_title'.
        item.title = item.short_title || item.title;
        delete item.short_title;
        // At the moment, we never actually use the 'short_description'
        // so no use including it.
        delete item.short_description;
        fixBlock(item);
      });
    }
  }
  if (document.related_content) {
    document.related_content.forEach(block => {
      fixBlock(block);
    });
  }
}

/** Pretty print the absolute path relative to the current directory. */
function ppPath(filePath) {
  return path.relative(process.cwd(), filePath);
}

function buildHtmlAndJson({ filePath, output, buildHtml, quiet, titles }) {
  const start = new Date();
  const data = fs.readFileSync(filePath, "utf8");

  const options = {
    doc: JSON.parse(data)
  };

  let rendered = null;

  // always expect this to be a relative URL
  if (!options.doc.mdn_url.startsWith("/")) {
    throw new Error(
      `Document's .mdn_url doesn't start with / (${options.doc.mdn_url})`
    );
  }
  const uri = decodeURI(options.doc.mdn_url);

  // This can totally happen if you're building from multiple sources
  // E.g. `yarn start packaged1 packaged2`
  // In this case, if some .json file in packaged1 has an mdn_url of
  // for example /en-US/docs/Foo/bar and then this comes up again from
  // a file in packaged2, then igore it this time.
  if (uri in titles) {
    return null;
  }
  titles[uri] = options.doc.title;

  const destination = path.join(output, uri);

  fs.mkdirSync(destination, { recursive: true });

  if (options.doc.redirect_url) {
    const outfileRedirect = path.join(destination, "index.redirect");

    // This `options.doc.redirect_url` is either something like
    // '/api/v1/doc/en-US/Learn/Common_questions' or something like
    // 'https://wiki.developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs'
    // of which both are invalid unless we process it a little.
    const redirectUrl = correctRedirectURL(options.doc.redirect_url);
    fs.writeFileSync(outfileRedirect, redirectUrl);

    if (!quiet) {
      let outMsg = `Wrote ${ppPath(outfileRedirect)}`;
      console.log(`${chalk.grey(outMsg)} ${Date.now() - start}ms`);
    }
  } else {
    // Stumptown produces a `.related_content` for every document. But it
    // contains data that is either not needed or not appropriate for the way
    // we're using it in the renderer. So mutate it for the specific needs
    // of the renderer.
    fixRelatedContent(options.doc);

    if (options.doc.body) {
      // Find blocks of code and transform it to syntax highlighted code.
      fixSyntaxHighlighting(options.doc);
      // Creates new mdn_url's for the browser-compatibility-table to link to
      // pages within this project rather than use the absolute URLs
      normalizeURLs(options.doc);
    }

    const outfileHtml = path.join(destination, "index.html");
    const outfileJson = path.join(destination, "index.json");

    if (buildHtml) {
      try {
        rendered = render(
          <ServerLocation url={uri}>
            <App {...options} />
          </ServerLocation>,
          options
        );
      } catch (ex) {
        console.error(`Rendering HTML failed!
      uri=${uri}
      filePath=${filePath}`);
        throw ex;
      }
    }

    if (rendered) {
      fs.writeFileSync(outfileHtml, rendered);
    }
    fs.writeFileSync(
      outfileJson,
      process.env.NODE_ENV === "development"
        ? JSON.stringify(options, null, 2)
        : JSON.stringify(options)
    );

    if (!quiet) {
      let outMsg = `Wrote ${ppPath(outfileJson)}`;
      if (rendered) {
        outMsg += ` and ${ppPath(outfileHtml)}`;
      }
      console.log(`${chalk.grey(outMsg)} ${Date.now() - start}ms`);
    }
  }
  return { filePath, uri };
}

function correctRedirectURL(redirectUrl) {
  if (redirectUrl.startsWith("/api/v1/doc/")) {
    redirectUrl = redirectUrl.replace("/api/v1/doc/", "");
    const split = redirectUrl.split("/");
    split.splice(1, 0, "docs");
    split.unshift("");
    return split.join("/");
  } else if (redirectUrl.includes("://")) {
    const parsed = url.parse(redirectUrl);
    if (parsed.host.endsWith("developer.mozilla.org")) {
      return parsed.pathname;
    }
  }

  // I give up!
  return redirectUrl;
}

const options = buildOptions({
  help: {
    type: "boolean",
    alias: ["h"],
    default: false
  },

  output: {
    type: "string",
    alias: "o",
    default: STATIC_ROOT
  },

  version: {
    type: "boolean",
    alias: ["v"],
    default: false
  },

  quiet: {
    type: "boolean",
    alias: ["q"],
    default: false
  },

  debug: "boolean",

  "build-html": {
    type: "boolean",
    alias: ["b"],
    default: JSON.parse(process.env.CLI_BUILD_HTML || "false")
  },

  watch: {
    type: "boolean",
    alias: "w",
    default: false
  },

  // Special option for positional arguments (`_` in minimist)
  arguments: "string"
});

const args = minimist(process.argv.slice(2), options);

if (args["help"]) {
  console.log(`
  Usage:
    yarn run run [options] [FILES AND/OR FOLDERS]

  Options:
    -h, --help         print usage information
    -v, --version      show version info and exit
    -d, --debug        with more verbose output (currently not supported!)
    -q, --quiet        as little output as possible
    -o, --output       root directory to store built files (default ${STATIC_ROOT})
    -b, --build-html   also generate fully formed index.html files (or env var $CLI_BUILD_HTML)
    -w, --watch        watch stumptown content for changes
    -t, --touchfile    file to touch to trigger client rebuild (default ${TOUCHFILE})

    Note that the default is to build all packaged .json files found in
    '../stumptown/packaged' (relevant to the cli directory).
    `);
  process.exit(0);
}

if (args["version"]) {
  console.log(require("./package.json").version);
  process.exit(0);
}

if (args["debug"]) {
  console.warn("--debug is not yet supported");
  process.exit(1);
}

const touchfile = args.touchfile || TOUCHFILE;
if (touchfile) {
  // XXX
  // console.warn(`CHECK ${touchfile} THAT IS WRITABLE`);
}

const paths = args["_"];
if (!paths.length) {
  paths.push(path.join(STUMPTOWN_CONTENT_ROOT, "packaged"));
}

function walk(directory, callback) {
  const files = fs.readdirSync(directory);
  // First walk all the files. Then all the directories.
  // This means we're making sure we processing any "parent" page
  // before its children which'll be necessary for the ability to build
  // a breadcrumb on the leaf pages.
  const filepaths = files.map(filename => path.join(directory, filename));

  // First every not-directory
  filepaths
    .filter(filepath => !fs.statSync(filepath).isDirectory())
    .forEach(filepath => {
      if (filepath.endsWith(".json")) {
        callback(filepath);
      }
    });

  // Now dig into each directory
  filepaths
    .filter(filepath => fs.statSync(filepath).isDirectory())
    .forEach(filepath => {
      walk(filepath, callback);
    });
}

function run(paths, returnDocumentBuilt = false) {
  const output = args.output;
  const buildHtml = args["build-html"];
  const quiet = args["quiet"];

  const startTime = Date.now();
  const built = [];
  const titles = {};

  /** Run buildHtmlAndJson() but be smart about how we're adding its
   * result to an array.
   * The buildHtmlAndJson() function will always return an object of useful
   * information, but if you run it 1,000 times that means the array
   * that keeps track of what was built will be so large in memory that
   * Node will crash with Out-of-memory.
   * So, when you have a lot to do, just compute an array of boolean results,
   * but if explicitly asked (`returnDocumentBuilt`) then return an array
   * of result objects. This latter is useful for the watcher that builds
   * one file at a time and populates some information about that in the
   * client.
   */
  function wrapBuildHtmlAndJson(...args) {
    const result = buildHtmlAndJson(...args);
    if (returnDocumentBuilt) {
      built.push(result);
    } else {
      built.push(!!result);
    }
  }

  paths.forEach(fileOrDirectory => {
    const lstat = fs.lstatSync(fileOrDirectory);
    if (lstat.isDirectory()) {
      const todo = [];
      walk(fileOrDirectory, filePath => {
        todo.push(filePath);
      });

      console.log(
        `About to process ${fileOrDirectory} (${todo.length.toLocaleString()} files)`
      );
      const progressBar = new ProgressBar({ includeMemory: true });
      progressBar.init(todo.length);

      todo.forEach((filePath, index) => {
        built.push(
          wrapBuildHtmlAndJson({
            filePath,
            output,
            buildHtml,
            quiet,
            titles
          })
        );
        progressBar.update(index + 1);
      });
      if (quiet) {
        progressBar.stop();
      }
    } else if (lstat.isFile()) {
      built.push(
        wrapBuildHtmlAndJson({
          filePath: fileOrDirectory,
          output,
          buildHtml,
          quiet,
          titles
        })
      );
    } else {
      throw new Error(`neither file or directory ${fileOrDirectory}`);
    }
  });
  const overlapFiles = built.filter(p => !p);
  const buildFiles = built.filter(p => !!p);

  const endTime = Date.now();
  const tookSeconds = (endTime - startTime) / 1000;
  const msPerDoc = (endTime - startTime) / buildFiles.length;
  const rate = buildFiles.length / tookSeconds;
  console.log(
    chalk.green(
      `Built ${buildFiles.length.toLocaleString()} documents in ${tookSeconds.toFixed(
        1
      )}s ` +
        `(approximately ${msPerDoc.toFixed(1)} ms/doc - ${rate.toFixed(
          1
        )} docs/sec)`
    )
  );
  if (overlapFiles) {
    chalk.yellow(
      `${overlapFiles.length.toLocaleString()} files overlapped ` +
        `and were skipped.`
    );
  }

  const titlesByLocale = {};
  Object.entries(titles).forEach(([uri, title]) => {
    if (title) {
      const localeKey = uri.split("/")[1];
      titlesByLocale[localeKey] = titlesByLocale[localeKey] || [];
      titlesByLocale[localeKey].push({ uri, title });
    }
  });

  Object.entries(titlesByLocale).forEach(([locale, localeTitles]) => {
    const titles = {};
    const allTitlesFilepath = path.join(STATIC_ROOT, `${locale}/titles.json`);
    const updateTitlesFiles = fs.existsSync(allTitlesFilepath);
    if (updateTitlesFiles) {
      titles.titles = JSON.parse(fs.readFileSync(allTitlesFilepath, "utf8"))[
        "titles"
      ];
    } else {
      titles.titles = {};
    }
    localeTitles.forEach(built => {
      // TODO: Some day, we'll make it easier to "influence" the popularity
      // number. At the moment (Nov 2019), it just needs to be present
      // for the in-client search widget to work at all.
      // In the future this could be a lookup based on `built.uri` where
      // perhaps we pre-process a Google Analytics Pageviews CSV report into
      // a map and use that to give each URI a number that somehow reflects
      // "popularity". Or, it could be manually determined based on the URI
      // like `if (uri.includes('Archive')) popularity /= 2.0`
      titles.titles[built.uri] = { title: built.title, popularity: 0.0 };
    });

    fs.writeFileSync(allTitlesFilepath, JSON.stringify(titles, null, 2));
    console.log(
      `${allTitlesFilepath} now contains ${Object.keys(
        titles.titles
      ).length.toLocaleString()} documents (${
        updateTitlesFiles ? "updated" : "fresh"
      }).`
    );
  });

  return buildFiles;
}

class ProgressBar {
  constructor({ prefix = "Progress: ", includeMemory = false }) {
    this.total;
    this.current;
    this.prefix = prefix;
    this.includeMemory = includeMemory;
    this.barLength =
      process.stdout.columns - prefix.length - "100.0%".length - 5;
    if (includeMemory) {
      this.barLength -= 10;
    }
  }

  init(total) {
    if (!total) {
      throw new Error("Must be initialized with a >0 number.");
    }
    this.total = total;
    this.current = 0;
    this.update(this.current);
  }

  update(current) {
    this.current = current;
    this.draw(this.current / this.total);
  }

  draw(currentProgress) {
    const filledBarLength = Math.round(currentProgress * this.barLength);
    const emptyBarLength = this.barLength - filledBarLength;

    const filledBar = this.getBar(filledBarLength, "█");
    const emptyBar = this.getBar(emptyBarLength, "░");

    const percentageProgress = this.rJust(
      `${(currentProgress * 100).toFixed(1)}%`,
      "100.0%".length
    );

    let out = `${this.prefix}[${filledBar}${emptyBar}] | ${percentageProgress}`;
    if (this.includeMemory) {
      const bytes = process.memoryUsage().heapUsed;
      out += ` | ${this.rJust(this.humanFileSize(bytes))}`;
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(out);
  }

  stop() {
    process.stdout.write("\n");
  }

  humanFileSize(size) {
    if (size < 1024) return size + " B";
    let i = Math.floor(Math.log(size) / Math.log(1024));
    let num = size / Math.pow(1024, i);
    let round = Math.round(num);
    num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;
    return `${num} ${"KMGTPEZY"[i - 1]}B`;
  }
  rJust(str, length) {
    while (str.length < length) {
      str = ` ${str}`;
    }
    return str;
  }

  getBar(length, char, color = a => a) {
    return color(
      Array(length)
        .fill(char)
        .join("")
    );
  }
}

async function runStumptownContentBuildJson(path) {
  let response;
  try {
    response = await fetch(BUILD_JSON_SERVER, {
      method: "post",
      body: JSON.stringify({ path }),
      headers: { "Content-Type": "application/json" }
    });
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error(`${response.statusText} from ${BUILD_JSON_SERVER}`);
    }
  } catch (ex) {
    throw ex;
  }
}

function triggerTouch(documents, changedFile) {
  let newContent = `// Timestamp: ${new Date()}\n`;
  newContent += `const documents = ${JSON.stringify(documents, null, 2)}\n`;
  newContent += `const changedFile = ${JSON.stringify(changedFile)}\n`;
  newContent += `const hasEDITOR = ${JSON.stringify(
    Boolean(process.env.EDITOR)
  )}\n`;
  newContent += `const touched = { documents, changedFile, hasEDITOR };\n`;
  newContent += "export default touched;";
  fs.writeFileSync(touchfile, newContent);
  console.log(
    chalk.green(
      `Touched ${ppPath(touchfile)} to trigger client dev server reload`
    )
  );
}

if (args.watch) {
  const contentDir = path.join(STUMPTOWN_CONTENT_ROOT, "content");
  const watcher = sane(contentDir, {
    glob: ["**/*.md", "**/*.yaml"]
  });
  watcher.on("ready", () => {
    console.log(`Watching over ${ppPath(contentDir)} for changes...`);
  });
  watcher.on("change", async filepath => {
    console.log("file changed", filepath);
    const absoluteFilePath = path.join(contentDir, filepath);

    let result;
    try {
      result = await runStumptownContentBuildJson(absoluteFilePath);
    } catch (ex) {
      throw ex;
    }

    const { built, error } = result;
    if (error) {
      console.log(
        chalk.red(
          `Result from stumptown-content build JSON: ${error.toString()}`
        )
      );
    } else {
      console.log(
        chalk.green(
          `Stumptown-content build-json built from ${ppPath(
            built.docsPath
          )} to ${ppPath(built.destPath)}`
        )
      );
    }

    if (error) {
      console.error(error);
    } else {
      console.log(`Running for packaged file ${built.destPath}`);
      const documents = run([built.destPath], { returnDocumentBuilt: true });
      const buildFiles = documents.map(d => ppPath(d["filePath"]));
      console.log(chalk.green(`Built documents from: ${buildFiles}`));
      triggerTouch(documents, {
        path: absoluteFilePath,
        name: path.basename(absoluteFilePath)
      });
    }
  });
} else {
  run(paths);
}
