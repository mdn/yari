const SERVER_PORT = process.env.SERVER_PORT || 5000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Allow the `process.env.BUILD_LIVE_SAMPLES_BASE_URL` to be falsy
// if it *is* set.
const LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LIVE_SAMPLES_BASE_URL !== undefined
    ? process.env.BUILD_LIVE_SAMPLES_BASE_URL
    : SERVER_URL;

const INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.BUILD_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

module.exports = { LIVE_SAMPLES_BASE_URL, INTERACTIVE_EXAMPLES_BASE_URL };
