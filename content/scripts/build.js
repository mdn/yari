const fs = require("fs");
const path = require("path");

const chalk = require("chalk");
const cheerio = require("cheerio");
const yaml = require("js-yaml");

require("dotenv").config();

const { packageBCD } = require("./resolve-bcd");
const ProgressBar = require("ssr/progress-bar");

function runBuild(options) {
  const { root, destination } = options;
  const builder = new Builder(root, destination, options);
  builder.start();
}

// Enums for return values
const processing = Object.freeze({
  ALREADY: "already",
  PROCESSED: "processed",
  EMPTY: "empty",
  NO_HTML: "no_html",
  EXCLUDED: "excluded"
});

class Builder {
  constructor(root, destination, options) {
    this.root = root;
    this.destination = destination;
    // this.locales = options.locales;
    this.options = options;

    this.progressBar = !options.noProgressbar
      ? new ProgressBar({
          includeMemory: true
        })
      : null;
  }
  initProgressbar(total) {
    this.progressBar && this.progressBar.init(total);
  }
  tickProgressbar(incr) {
    this.progressBar && this.progressBar.update(incr);
  }
  stopProgressbar() {
    this.progressBar && this.progressBar.stop();
  }

  printProcessing(result, fileWritten) {
    !this.progressBar && console.log(`${result}: ${fileWritten}`);
  }

  start() {
    // To be able to make a progress bar we need to first count what we're
    // going to need to do.
    if (this.progressBar) {
      this.initProgressbar(this.countFolders());
    }

    // Now do similar to what countFolders() does but actually process each
    let total = 0;

    // Record of counts of all results
    const counts = {};
    Object.values(processing).forEach(key => {
      counts[key] = 0;
    });

    this.getLocaleRootFolders().forEach(filepath => {
      walker(filepath, (folder, files) => {
        if (this.excludeFolder(folder, filepath, files)) {
          counts[processing.EXCLUDED]++;
          return;
        }
        let wrote;
        let result;
        try {
          [result, wrote] = this.processFolder(folder);
          this.printProcessing(result, wrote);
        } catch (err) {
          // If a crash happens inside processFolder it's hard to debug
          // if you don't know which files/folders caused it. So inject
          // some logging of that before throwing.
          console.error(chalk.yellow(`Error happened processing: ${folder}`));

          // XXX need to decide what to do with errors.
          // We could increment a counter and dump all errors to a log file.
          throw err;
        }
        counts[result]++;
        this.tickProgressbar(++total);
      });
    });
    console.log(counts);
  }

  /** Return true if for any reason this folder should not be processed */
  excludeFolder(folder, localeFolder, files) {
    if (this.options.foldersearch.length) {
      const foldername = folder.replace(localeFolder, "");
      if (
        !this.options.foldersearch.some(search => foldername.includes(search))
      ) {
        return true;
      }
    }

    return !(files.includes("index.html") && files.includes("index.yaml"));
  }

  getLocaleRootFolders() {
    const { locales } = this.options;
    const files = fs.readdirSync(this.root);
    const folders = [];
    for (const name of files) {
      const filepath = path.join(this.root, name);
      const isDirectory = fs.statSync(filepath).isDirectory();
      if (isDirectory && (!locales.length || locales.includes(name))) {
        folders.push(filepath);
      }
    }
    return folders;
  }

  countFolders() {
    let folders = 0;
    this.getLocaleRootFolders().forEach(filepath => {
      walker(filepath, (_, files) => {
        if (files.includes("index.html") && files.includes("index.yaml")) {
          folders++;
        }
      });
    });
    return folders;
  }

  processFolder(folder) {
    const doc = {};
    const metadata = yaml.safeLoad(
      fs.readFileSync(path.join(folder, "index.yaml"))
    );
    // The destination is the same as source but with a different base.
    // If the file *came from* /path/to/files/en-US/foo/bar/
    // the final destination is /path/to/build/en-US/foo/bar/index.json
    const destination = path.join(
      folder.replace(this.root, this.destination),
      "index.json"
    );

    // When the KS thing works we won't need this line

    // // REAL
    // const rawHtml = fs.readFileSync(path.join(folder, "index.html"), "utf8");
    // const renderedHtml = this.renderHtml(rawHtml, metadata);
    // FAKE
    // const rawHtml = fs.readFileSync(path.join(folder, "raw.html"), "utf8");
    const renderedHtml = fs.readFileSync(
      path.join(folder, "index.html"),
      "utf8"
    );

    const $ = cheerio.load(`<div id="_body">${renderedHtml}</div>`, {
      decodeEntities: false
    });

    // Remove those '<span class="alllinks"><a href="/en-US/docs/tag/Web">View All...</a></span>' links
    // Remove any completely empty <p>, <dl>, or <div> tags.
    $("p:empty,dl:empty,div:empty,span.alllinks").remove();

    // let macroCalls = extractMacroCalls(rawHtml);

    // Note that 'extractSidebar' will always return a string.
    // And if it finds a sidebar section, it gets removed from '$' too.
    doc.sidebarHTML = extractSidebar($);

    const sections = [];
    let section = cheerio
      .load("<div></div>", { decodeEntities: false })("div")
      .eq(0);

    const iterable = [...$("#_body")[0].childNodes];

    let c = 0;
    iterable.forEach(child => {
      if (child.tagName === "h2") {
        if (c) {
          sections.push(...addSections(section.clone()));
          section.empty();
        }
        c = 0;
      }
      // We *could* wrap this in something like `if (child.tagName) {`
      // which would exclude any node that isn't a tag, such as comments.
      // That might make the DOM nodes more compact and memory efficient.
      c++;
      section.append(child);
    });
    if (c) {
      sections.push(...addSections(section.clone()));
    }

    doc.title = metadata.title;
    doc.body = sections;

    doc.last_modified = metadata.modified;
    const destDir = path.dirname(destination);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(doc, null, 2));
    return [processing.PROCESSED, destination];
  }

  renderHtml(rawHtml, metadata) {
    // XXX Ryan! This is where we need that sweet KumaScript action!
    throw new Error("under construction");
  }
}

function walker(root, callback) {
  const files = fs.readdirSync(root);
  for (const name of files) {
    const filepath = path.join(root, name);
    const isDirectory = fs.statSync(filepath).isDirectory();
    if (isDirectory) {
      callback(
        filepath,
        fs.readdirSync(filepath).filter(name => {
          return !fs.statSync(path.join(filepath, name)).isDirectory();
        })
      );
      // Now go deeper
      walker(filepath, callback);
    }
  }
}

/** Extract and mutate the $ if it as a "Quick_Links" section */
function extractSidebar($) {
  const search = $("#Quick_Links");
  if (!search.length) {
    return "";
  }
  const sidebarHtml = search.html();
  search.remove();
  return sidebarHtml;
}

/** Return an array of new sections to be added to the complete document.
 *
 * Generally, this function is called with a cheerio (`$`) section that
 * has HTML in it. The task is to structure that a little bit.
 * If the HTML inside the '$' is:
 *
 *   <h2 id="foo">Foo</h2>
 *   <p>Bla bla</p>
 *   <ul><li>One</li></ul>
 *
 * then, the expected output is to return:
 *
 *   [{
 *       type: "prose",
 *       id: "foo",
 *       title: "Foo"
 *       content: "<p>Bla bla<p>\n<ul><li>One</li></ul>"
 *   }]
 *
 * The reason it's always returning an array is because of special
 * sections. A special section is one where we try to transform it
 * first. For example BCD tables. If the input is this:
 *
 *   <h2 id="browser_compat">Browser Compat</h2>
 *   <div class="bc-data" id="bcd:foo.bar.thing">...</div>
 *
 * Then, extract the ID, get the structured data and eventually return this:
 *
 *   [{
 *     type: "browser_compatibility",
 *     value: {
 *        query: "foo.bar.thing",
 *        id: "browser_compat",
 *        title: "Browser Compat",
 *        data: {....}
 *   }]
 *
 * At the time of writing (Jan 2020), there is only one single special type of
 * section and that's BCD. The idea is we look for a bunch of special sections
 * and if all else fails, just leave it as HTML as is.
 */
function addSections($) {
  if ($.find("div.bc-data").length) {
    /** If there's exactly 1 BCD table the only section to add is something
     * like this:
     *    {
     *     "type": "browser_compatibility",
     *     "value": {
     *       "title": "Browser compatibility",
     *       "id": "browser_compatibility",
     *        "query": "html.elements.video",
     *        "data": {....}
     *    }
     *
     * Where the 'title' and 'id' values comes from the <h2> tag (if available).
     *
     * However, if there are **multiple BCD tables**, which is rare, the it
     * needs to return something like this:
     *
     *   [{
     *     "type": "prose",
     *     "value": {
     *       "id": "browser_compatibility",
     *       "title": "Browser compatibility"
     *       "content": "Possible stuff before the table"
     *    },
     *    {
     *     "type": "browser_compatibility",
     *     "value": {
     *        "query": "html.elements.video",
     *        "data": {....
     *    },
     *   {
     *     "type": "prose",
     *     "value": {
     *       "content": "Any other stuff before table maybe"
     *    },
     */
    // if (macroCalls.Compat.length > 1) {
    if ($.find("div.bc-data").length > 1) {
      const subSections = [];
      let section = cheerio
        .load("<div></div>", { decodeEntities: false })("div")
        .eq(0);

      // Loop over each and every "root element" in the node and keep piling
      // them up in a buffer, until you encounter a `div.bc-table` then
      // add that to the stack, clear and repeat.
      let iterable = [...$[0].childNodes];
      let c = 0;
      iterable.forEach(child => {
        if (
          child.tagName === "div" &&
          child.attribs &&
          child.attribs.class &&
          /bc-data/.test(child.attribs.class)
        ) {
          if (c) {
            subSections.push(..._addSectionProse(section.clone()));
            section.empty();
            c = 0; // reset the counter
          }
          section.append(child);
          subSections.push(..._addSingleSectionBCD(section.clone()));
          section.empty();
        } else {
          section.append(child);
          c++;
        }
      });
      if (c) {
        subSections.push(..._addSectionProse(section.clone()));
      }
      return subSections;
    } else {
      return _addSingleSectionBCD($);
    }
  }

  // all else, leave as is
  return _addSectionProse($);
}

function _addSingleSectionBCD($) {
  let id = null;
  let title = null;

  const h2s = $.find("h2");
  if (h2s.length === 1) {
    id = h2s.attr("id");
    title = h2s.text();
  }

  const dataQuery = $.find("div.bc-data").attr("id");
  // Some old legacy documents haven't been re-rendered yet, since it
  // was added, so the `div.bc-data` tag doesn't have a `id="bcd:..."`
  // attribute. If that's the case, bail and fail back on a regular
  // prose section :(
  if (!dataQuery) {
    // I wish there was a good place to log this!
    return _addSectionProse($);
  }
  const query = dataQuery.replace(/^bcd:/, "");
  const data = packageBCD(query);
  return [
    {
      type: "browser_compatibility",
      value: {
        title,
        id,
        data,
        query
      }
    }
  ];
}

function _addSectionProse($) {
  let id = null;
  let title = null;
  // Maybe this should check that the h2 is first??
  const h2s = $.find("h2");
  if (h2s.length === 1) {
    id = h2s.attr("id");
    title = h2s.text();
    // XXX Maybe this is a bad idea.
    // See https://wiki.developer.mozilla.org/en-US/docs/MDN/Contribute/Structures/Page_types/API_reference_page_template
    // where the <h2> needs to be INSIDE the `<div class="note">`.
    h2s.remove();
    // } else if (h2s.length > 1) {
    //     throw new Error("Too many H2 tags");
  }

  return [
    {
      type: "prose",
      value: {
        id,
        title,
        content: $.html().trim()
      }
    }
  ];
}

function extractMacroCalls(text) {
  const RECOGNIZED_MACRO_NAMES = ["Compat"];

  function evaluateMacroArgs(argsString) {
    if (argsString.startsWith("{") && argsString.endsWith("}")) {
      return JSON.parse(argsString);
    }
    if (argsString.includes(",")) {
      return eval(`[${argsString}]`);
    }
    // XXX A proper parser instead??
    return eval(argsString);
  }

  const calls = {};
  /**
   * Note that the text can have escaped macros. For example:
   *
   *    This is how you write a macros: \{{Compat("foo.bar")}}
   *
   */
  const matches = text.matchAll(/[^\\]{{\s*(\w+)\s*\((.*?)\)\s*}}/g);
  for (const match of matches) {
    const macroName = match[1];
    if (RECOGNIZED_MACRO_NAMES.includes(macroName)) {
      if (!calls[macroName]) {
        calls[macroName] = [];
      }
      const macroArgs = evaluateMacroArgs(match[2].trim());
      calls[macroName].push(macroArgs);
    }
  }
  return calls;
}

module.exports = {
  runBuild
};
