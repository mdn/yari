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
function mapToURI(document) {
  return url.parse(document.mdn_url).pathname;
}

/** In the document, there's related_content and it contains keys
 * called 'mdn_url'. We need to transform them to relative links
 * that works with our router.
 * This /mutates/ the document data.
 */
function fixRelatedContentURIs(document) {
  function fixBlock(block) {
    if (block.content) {
      block.content.forEach(item => {
        if (item.mdn_url) {
          item.uri = mapToURI(item);
          delete item.mdn_url;
        }
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
    document: JSON.parse(data)
  };

  // A temporary fix for the mdn_url values in the related_content.
  fixRelatedContentURIs(options.document);

  // Find blocks of syntax code and transform it to syntax highlighted code.
  if (options.document.body) {
    fixSyntaxHighlighting(options.document);
  }

  const uri = mapToURI(options.document);

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
  return { document: options.document, uri };
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

function run(packagedPath, callback) {
  Promise.all(
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
      titles.titles[built.uri] = built.document.title;
    });

    await writeFile(allTitlesFilepath, JSON.stringify(titles, null, 2));
    console.log(
      `${allTitlesFilepath} now contains ${
        Object.keys(titles).length
      } documents.`
    );
  });
}

async function runStumptownContentBuildJson(path, callback) {
  let response;
  try {
    response = await fetch(BUILD_JSON_SERVER, {
      method: "post",
      body: JSON.stringify({ path }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    callback(null, result);
  } catch (ex) {
    callback(ex, null);
  }
  // const child = execFile(
  //   "npm",
  //   ["run", "build-json", searchPath],
  //   {
  //     cwd: STUMPTOWN_CONTENT_ROOT
  //   },
  //   (error, stdout, stderr) => {
  //     if (error) {
  //       throw error;
  //     }
  //     // console.log(stdout);
  //     // XXX Avoid callback and use promises or something?
  //     callback(stdout);
  //   }
  // );
}

function triggerTouch(msg) {
  const newContent = `/**
  ${msg}

  Timestamp: ${new Date()}
  */`;
  fs.writeFileSync(touchfile, newContent);
  console.log(`Touched ${touchfile} to trigger client dev server reload`);
}

if (args.watch) {
  const contentDir = path.join(STUMPTOWN_CONTENT_ROOT, "content");
  const watcher = sane(contentDir, {
    glob: ["**/*.md", "**/*.yaml"]
  });
  watcher.on("ready", () => {
    console.log(`Watching over ${contentDir} for changes...`);
  });
  watcher.on("change", (filepath, root, stat) => {
    console.log("file changed", filepath, path.join(contentDir, filepath));

    // At this point, the 'filepath' is relative to the 'contentDir'.
    // For example, it might be 'html/reference/elements/video/prose.md'
    // Now need to convert that to the "equivalent" search path
    // which should be 'html/reference/elements/video'.
    const split = filepath.split(path.sep);
    const searchPath = split.slice(0, split.length - 1).join(path.sep);
    runStumptownContentBuildJson(searchPath, packagedDirectories => {
      console.log("Result from stumptown-content packaging:");
      console.log(packagedDirectories);

      // Now, if the 'searchPath' was 'html/reference/elements/video'
      // the *packaged path* is 'packaged/'html/reference/elements/video.json'.
      // But for then 'run()' function you need the full absolute path.

      const packagedPath = [
        path.join(STUMPTOWN_CONTENT_ROOT, "packaged", searchPath + ".json")
      ];
      run(packagedPath, buildFiles => {
        triggerTouch(buildFiles);
      });
    });
  });
} else {
  run(paths);
}
