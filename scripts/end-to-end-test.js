/** The purpose of this file is to do sanity checks of things that are
 * hard to automate with unit tests. These tests don't have to (and shouldn't!)
 * be particularly specific.
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

(() => {
  /** Check that the /en-US/docs/Foo/Bar page built and
   * is sane.
   */

  const directory = "client/build/en-us/docs/foo/bar/";
  const jsonRaw = fs.readFileSync(path.join(directory, "index.json"), "utf8");
  const json = JSON.parse(jsonRaw);
  if (!json.doc.title) {
    throw new Error("No document.title");
  }
  if (!json.doc.body || !json.doc.body.length) {
    throw new Error("No document.body");
  }
  const htmlRaw = fs.readFileSync(path.join(directory, "index.html"), "utf8");
  const htmlDoc = cheerio.load(htmlRaw);
  if (!htmlDoc("title").text().includes("Foo Bar")) {
    throw new Error("<title> tag is expected to have the word 'Foo Bar'");
  }
  if (!htmlDoc("p").text().includes("I'm alive!")) {
    throw new Error(htmlDoc("p").html());
  }
})();
