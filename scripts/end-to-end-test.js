/** The purpose of this file is to do sanity checks of things that are
 * hard to automate with unit tests. These tests don't have to (and shouldn't!)
 * be particularly specific.
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

(() => {
  /** Check that the /en-US/docs/Web/HTML/Element/video page built and
   * is sane.
   */

  const directory = "client/build/en-US/docs/Web/HTML/Element/video/";
  const videoJsonRaw = fs.readFileSync(
    path.join(directory, "index.json"),
    "utf8"
  );
  const videoJson = JSON.parse(videoJsonRaw);
  if (!videoJson.doc.title) {
    throw new Error("No document.title");
  }
  if (!videoJson.doc.body || !videoJson.doc.body.length) {
    throw new Error("No document.body");
  }
  const videoHtmlRaw = fs.readFileSync(
    path.join(directory, "index.html"),
    "utf8"
  );
  const videoHtmlDoc = cheerio.load(videoHtmlRaw);
  if (
    !videoHtmlDoc("title")
      .text()
      .includes("Video")
  ) {
    throw new Error("<title> tag is expected to have the word 'Video'");
  }
  if (
    !videoHtmlDoc("h1.page-title")
      .text()
      .includes("Video")
  ) {
    throw new Error(
      "<h1 class=page-title> tag is expected to have the word 'Video'"
    );
  }
})();
