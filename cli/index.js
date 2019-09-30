import React from "react";
import fs from "fs";
import url from "url";
import path from "path";
import util from "util";
// const crypto = require("crypto");

// This is necessary because the cli.js is in dist/cli.js
// and we need to reach the .env this way.
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

import fetch from "node-fetch";
import sane from "sane";
import glob from "glob";
import minimist from "minimist";
import buildOptions from "minimist-options";
import { ServerLocation } from "@reach/router";
import sourceMapSupport from "source-map-support";
import chalk from "chalk";

import { App } from "../client/src/app";
import render from "./render";
import { fixSyntaxHighlighting } from "./syntax-highlighter";

const STUMPTOWN_CONTENT_ROOT =
  process.env.STUMPTOWN_CONTENT_ROOT || path.join(__dirname, "../../stumptown");
const STATIC_ROOT = path.join(__dirname, "../../client/build");
const TOUCHFILE = path.join(__dirname, "../../client/src/touchthis.js");
const BUILD_JSON_SERVER =
  process.env.BUILD_JSON_SERVER || "http://localhost:5555";
sourceMapSupport.install();

// Turn callback based functions into functions you can "await".
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const accessFile = util.promisify(fs.access);

/* Return a absolute path that is the correct URI for the website */
function mapToURI(doc) {
  return url.parse(doc.mdn_url).pathname;
}

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
          item.uri = mapToURI(item);
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
  document.related_content.forEach(block => {
    fixBlock(block);
  });
}

/** Pretty print the absolute path relative to the current directory. */
function ppPath(filePath) {
  return path.relative(process.cwd(), filePath);
}

function buildHtmlAndJson({ filePath, output, buildHtml, quiet }) {
  const start = new Date();
  const data = fs.readFileSync(filePath, "utf8");
  // const buildHash = crypto
  //   .createHash("md5")
  //   .update(data)
  //   .digest("hex");

  const options = {
    doc: JSON.parse(data)
  };

  // Stumptown produces a `.related_content` for every document. But it
  // contains data is either not needed or not appropriate for the way
  // we're using it in the renderer. So mutate it for the specific needs
  // of the renderer.
  fixRelatedContent(options.doc);

  // Find blocks of syntax code and transform it to syntax highlighted code.
  if (options.doc.body) {
    fixSyntaxHighlighting(options.doc);
  }

  const uri = mapToURI(options.doc);

  const destination = path.join(output, uri);
  const outfileHtml = path.join(destination, "index.html");
  const outfileJson = path.join(destination, "index.json");
  // const outfileHash = path.join(destination, "index.hash");

  // let previousHash = "";
  // try {
  //   previousHash = fs.readFileSync(outfileHash, "utf8");
  // } catch (ex) {
  //   // That's fine
  // }
  // console.log("PREVIOUS HASH", [previousHash, buildHash]);

  let rendered = null;
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

  fs.mkdirSync(destination, { recursive: true });
  if (rendered) {
    fs.writeFileSync(outfileHtml, rendered);
  }
  fs.writeFileSync(
    outfileJson,
    process.env.NODE_ENV === "development"
      ? JSON.stringify(options, null, 2)
      : JSON.stringify(options)
  );
  // fs.writeFileSync(outfileHash, buildHash);

  if (!quiet) {
    let outMsg = `Wrote ${ppPath(outfileJson)}`;
    if (rendered) {
      outMsg += ` and ${ppPath(outfileHtml)}`;
    }
    console.log(`${chalk.grey(outMsg)} ${Date.now() - start}ms`);
  }
  return { filePath, doc: options.doc, uri };
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

/** Given an array of "things" return all distinct .json files.
 *
 * Note that these "things" can be a directory, a file path, or a
 * pattern.
 * Only if each thing is a directory do we search for *.json files
 * in there recursively.
 */
function expandFiles(directoriesPatternsOrFiles) {
  function findFiles(directory) {
    if (path.basename(directory) === "node_modules") {
      throw new Error(
        `Can't dig deeper into ${directory}. ` +
          `Doesn't look like stumptown content packaged location`
      );
    }
    const found = glob.sync(path.join(directory, "*.json"));

    fs.readdirSync(directory, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(directory, dirent.name))
      .map(findFiles)
      .forEach(files => found.push(...files));

    return found;
  }

  const filePaths = [];
  directoriesPatternsOrFiles.forEach(thing => {
    let files = [];
    if (thing.includes("*")) {
      // It's a pattern!
      files = glob.sync(thing);
    } else {
      const lstat = fs.lstatSync(thing);
      if (lstat.isDirectory()) {
        files = findFiles(thing);
      } else if (lstat.isFile()) {
        files = [thing];
      } else {
        throw new Error(`${thing} is neither file nor directory`);
      }
    }
    files.forEach(p => filePaths.includes(p) || filePaths.push(p));
  });
  return filePaths;
}

function run(paths) {
  return Promise.all(
    expandFiles(paths).map(filePath => {
      const output = args.output;
      return accessFile(filePath, fs.constants.R_OK)
        .catch(err => {
          console.error(err.toString());
          process.exit(1);
        })
        .then(() => {
          return buildHtmlAndJson({
            filePath,
            output,
            buildHtml: args["build-html"],
            quiet: args["quiet"]
          });
        });
    })
  ).then(async values => {
    console.log(chalk.green(`Built ${values.length} documents.`));
    const titles = {};
    // XXX Support locales!
    const allTitlesFilepath = path.join(STATIC_ROOT, "titles.json");
    try {
      titles.titles = JSON.parse(await readFile(allTitlesFilepath, "utf8"));
      console.warn(
        `Updating ${Object.keys(allTitles).length} file ${allTitlesFilepath}`
      );
    } catch (ex) {
      // throw ex;
      console.warn(`Starting a fresh new ${allTitlesFilepath}`);
      titles.titles = {};
    }
    values.forEach(built => {
      titles.titles[built.uri] = built.doc.title;
    });

    await writeFile(allTitlesFilepath, JSON.stringify(titles, null, 2));
    console.log(
      `${allTitlesFilepath} now contains ${Object.keys(
        titles.titles
      ).length.toLocaleString()} documents.`
    );
    return values;
  });
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

function triggerTouch(documents) {
  let newContent = `// Timestamp: ${new Date()}\n`;
  newContent += `const touched = ${JSON.stringify(documents, null, 2)}\n`;
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
      run([built.destPath]).then(documents => {
        const buildFiles = documents.map(d => ppPath(d["filePath"]));
        console.log(chalk.green(`Built documents from: ${buildFiles}`));
        triggerTouch(documents);
      });
    }
  });
} else {
  run(paths);
}
