import React from "react";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import sane from "sane";
import { ServerLocation } from "@reach/router";
import chalk from "chalk";
import sourceMapSupport from "source-map-support";

import { App } from "../client/src/app";
import render from "./render";
import ProgressBar from "./progress-bar";
import { fixSyntaxHighlighting } from "./syntax-highlighter";
import { normalizeURLs } from "./browser-compatibility-table";

sourceMapSupport.install();

// This is necessary because the ssr.js is in dist/ssr.js
// and we need to reach the .env this way.
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const PROJECT_ROOT = path.join(__dirname, "..", "..");
const STUMPTOWN_CONTENT_ROOT =
  process.env.STUMPTOWN_CONTENT_ROOT || path.join(PROJECT_ROOT, "stumptown");
const STATIC_ROOT = path.join(PROJECT_ROOT, "client", "build");
const TOUCHFILE = path.join(PROJECT_ROOT, "client", "src", "touchthis.js");

const BUILD_JSON_SERVER =
  process.env.BUILD_JSON_SERVER || "http://localhost:5555";

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

/** The breadcrumb is an array of parents include the document itself.
 * It only gets added to the document there are actual parents.
 */
function addBreadcrumbData(uri, document, allTitles) {
  // XXX This function is flawed!
  // It assumes that the "parent" is the document's slug minus the last
  // portion when split by '/'. E.g. it assumes that the parent URL
  // of /en-US/docs/Foo/Bar/bim is /en-US/docs/Foo/Bar but that is not
  // entirely right.
  // For example, in en-US, Ryan discovered, in
  // https://github.com/mdn/kuma/issues/6441#issuecomment-589402410
  // that there are at least 4 documents where you can't reply purely
  // on the path.
  // A more accurate solution is to rely on the document's metadata.
  // In particular the `parent_topic` piece which we don't have at the moment.
  // We have the `parent` but that's a localization thing.
  // So, it should be something like this:
  //
  //   while doc.parent_topic:
  //       parents.push(allTitles[doc.parent_top.slug])
  //       doc = doc.parent_topic
  //
  // Worth sanity checking and testing this.

  const parents = [];
  let split = uri.split("/");
  let parentUri;
  while (split.length > 2) {
    split.pop();
    parentUri = split.join("/");
    // This test makes it possible to "skip" certain URIs that might not
    // be a page on its own. For example: /en-US/docs/Web/ is a page,
    // and so is /en-US/ but there might not be a page for /end-US/docs/.
    if (allTitles[parentUri]) {
      parents.unshift({
        uri: parentUri,
        title: allTitles[parentUri].title
      });
    }
  }
  if (parents.length) {
    parents.push({
      uri: uri,
      title: document.short_title || document.title
    });
    document.parents = parents;
  }
}

/** Pretty print the absolute path relative to the current directory. */
function ppPath(filePath) {
  return path.relative(process.cwd(), filePath);
}

/**
 * Just a thin wrapper on the true workhorse buildHtmlAndJsonFromData
 * where you can supply the path to a .json that has the renderable content.
 */
function buildHtmlAndJson({ filePath, output, buildHtml, quiet, titles }) {
  const data = fs.readFileSync(filePath, "utf8");
  const doc = JSON.parse(data);
  const destinationDir = path.join(output, doc.mdn_url.toLowerCase());
  const start = new Date();
  try {
    const {
      uri,
      wasRendered,
      outfileHtml,
      outfileJson
    } = buildHtmlAndJsonFromDoc(doc, destinationDir, buildHtml, titles);
    if (!quiet) {
      let outMsg = `Wrote ${ppPath(outfileJson)}`;
      if (wasRendered) {
        outMsg += ` and ${ppPath(outfileHtml)}`;
      }
      console.log(`${chalk.grey(outMsg)} ${Date.now() - start}ms`);
    }

    return { uri, filePath };
  } catch (ex) {
    console.error(`Rendering HTML failed!
  uri=${doc.mdn_url}
  filePath=${filePath}`);
    throw ex;
  }
}

export function buildHtmlAndJsonFromDoc({
  doc,
  destinationDir,
  buildHtml,
  titles
}) {
  const options = { doc };

  let rendered = null;

  // always expect this to be a relative URL
  if (!options.doc.mdn_url.startsWith("/")) {
    throw new Error(
      `Document's .mdn_url doesn't start with / (${options.doc.mdn_url})`
    );
  }
  const uri = decodeURI(options.doc.mdn_url);

  // // This can totally happen if you're building from multiple sources
  // // E.g. `yarn start packaged1 packaged2`
  // // In this case, if some .json file in packaged1 has an mdn_url of
  // // for example /en-US/docs/Foo/bar and then this comes up again from
  // // a file in packaged2, then igore it this time.
  // if (uri in titles) {
  //   return null;
  // }
  // titles[uri] = options.doc.title;

  // const destination = path.join(output, uri.toLowerCase());

  fs.mkdirSync(destinationDir, { recursive: true });

  // if (options.doc.redirect_url) {
  //   const outfileRedirect = path.join(destination, "index.redirect");

  //   // This `options.doc.redirect_url` is either something like
  //   // '/api/v1/doc/en-US/Learn/Common_questions' or something like
  //   // 'https://wiki.developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs'
  //   // of which both are invalid unless we process it a little.
  //   const redirectUrl = correctRedirectURL(options.doc.redirect_url);
  //   fs.writeFileSync(outfileRedirect, redirectUrl);

  //   if (!quiet) {
  //     let outMsg = `Wrote ${ppPath(outfileRedirect)}`;
  //     console.log(`${chalk.grey(outMsg)} ${Date.now() - start}ms`);
  //   }
  // } else {

  // The `titles` object should contain every possible URI->Title mapping.
  // We can use that generate the necessary information needed to build
  // a breadcrumb in the React componentx.
  addBreadcrumbData(uri, options.doc, titles);

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

  const outfileHtml = path.join(destinationDir, "index.html");
  const outfileJson = path.join(destinationDir, "index.json");

  if (buildHtml) {
    rendered = render(
      <ServerLocation url={uri}>
        <App {...options} />
      </ServerLocation>,
      options
    );
  }

  let wasRendered = false;
  if (rendered) {
    fs.writeFileSync(outfileHtml, rendered);
    wasRendered = true;
  }
  fs.writeFileSync(
    outfileJson,
    process.env.NODE_ENV === "development"
      ? JSON.stringify(options, null, 2)
      : JSON.stringify(options)
  );

  // }
  return { uri, wasRendered, outfileHtml, outfileJson };
}

// function correctRedirectURL(redirectUrl) {
//   if (redirectUrl.startsWith("/api/v1/doc/")) {
//     redirectUrl = redirectUrl.replace("/api/v1/doc/", "");
//     const split = redirectUrl.split("/");
//     split.splice(1, 0, "docs");
//     split.unshift("");
//     return split.join("/");
//   } else if (redirectUrl.includes("://")) {
//     const parsed = url.parse(redirectUrl);
//     if (parsed.host.endsWith("developer.mozilla.org")) {
//       return parsed.pathname;
//     }
//   }

//   // I give up!
//   return redirectUrl;
// }

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

function renderDocuments(
  paths,
  { buildHtml, output, quiet, noProgressBar, ...args },
  returnDocumentBuilt = false
) {
  /**
   * It's more useful to display either progress bar or each built file, but not both.
   * But if `--quiet` is passed, we should disable both
   *
   * @see https://github.com/mdn/stumptown-renderer/pull/259#pullrequestreview-325419683
   */
  const useProgressBar =
    !quiet &&
    !noProgressBar &&
    (!JSON.parse(process.env.CI || "false") || !process.stdout.isTTY);
  const printEachBuiltFile = !quiet && !useProgressBar;

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
  function wrapBuildHtmlAndJson(args) {
    try {
      const result = buildHtmlAndJson(args);
      if (returnDocumentBuilt) {
        built.push(result);
      } else {
        built.push(!!result);
      }
    } catch (ex) {
      console.log(Object.keys(args));
      console.error(
        chalk.red(`buildHtmlAndJson failed!
      filepath=${args.filePath}`)
      );
      throw ex;
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
      const progressBar = useProgressBar
        ? new ProgressBar({
            includeMemory: true
          })
        : null;
      if (progressBar) {
        progressBar.init(todo.length);
      }

      todo.forEach((filePath, index) => {
        built.push(
          wrapBuildHtmlAndJson({
            filePath,
            output,
            buildHtml,
            quiet: !printEachBuiltFile,
            titles
          })
        );
        if (progressBar) {
          progressBar.update(index + 1);
        }
      });
      if (progressBar) {
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
    const allTitlesFilepath = path.join(
      STATIC_ROOT,
      `${locale.toLowerCase()}/titles.json`
    );
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

async function runStumptownContentBuildJson(path) {
  const response = await fetch(BUILD_JSON_SERVER, {
    method: "post",
    body: JSON.stringify({ path }),
    headers: { "Content-Type": "application/json" }
  });
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(`${response.statusText} from ${BUILD_JSON_SERVER}`);
  }
}

function triggerTouch(touchfile, documents, changedFile) {
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

export const OPTION_DEFAULTS = Object.freeze({
  output: STATIC_ROOT,
  buildHtml: JSON.parse(process.env.CLI_BUILD_HTML || "false"),
  watch: false,
  touchfile: TOUCHFILE,
  quiet: false,
  noProgressBar: false
});

function watch(options = {}) {
  options = { ...OPTION_DEFAULTS, ...options };
  const touchfile = options.touchfile;
  if (touchfile) {
    // XXX
    // console.warn(`CHECK ${touchfile} THAT IS WRITABLE`);
  }

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

    const result = await runStumptownContentBuildJson(absoluteFilePath);

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
      const documents = renderDocuments([built.destPath], options, {
        returnDocumentBuilt: true
      });
      const buildFiles = documents.map(d => ppPath(d["filePath"]));
      console.log(chalk.green(`Built documents from: ${buildFiles}`));
      triggerTouch(touchfile, documents, {
        path: absoluteFilePath,
        name: path.basename(absoluteFilePath)
      });
    }
  });
}

export function run(paths = [], options = {}) {
  options = { ...OPTION_DEFAULTS, ...options };
  if (options.watch) {
    watch(options);
  } else {
    renderDocuments(
      paths.length > 0
        ? paths
        : [path.join(STUMPTOWN_CONTENT_ROOT, "packaged")],
      options
    );
  }
}

const isRunDirectly = process.mainModule.filename === __filename;
if (isRunDirectly) {
  watch();
}
