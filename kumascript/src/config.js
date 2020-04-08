/**
 * KumaScript configuration options used by various other parts of the code.
 * Some of the values are  read from environment variables (which may be
 * set in the docker-compose.yml file in Kuma).
 *
 * @prettier
 */
const path = require("path");

module.exports = {
  documentURL: process.env["DOCUMENT_URL"] || "https://developer.mozilla.org",
  interactiveExamplesURL:
    process.env["INTERACTIVE_EXAMPLES_URL"] ||
    "https://interactive-examples.mdn.mozilla.net",
  liveSamplesURL:
    process.env["LIVE_SAMPLES_URL"] || "https://mdn.mozillademos.org",

  // NOTE(djf): In January 2019 I tried rendering 9500 documents, and
  // it resulted in 14,600 items in the cache for a total size of 41mb
  // of content.
  cacheMegabytes: parseInt(process.env["KUMASCRIPT_CACHE_MEGABYTES"]) || 200,

  // This is something that is configurable only for tests
  macrosDirectory: path.normalize(`${__dirname}/../macros/`)
};
