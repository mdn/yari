const LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_KS_LIVE_SAMPLES_BASE_URL || "https://mdn.mozillademos.org";

const INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.KS_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

module.exports = { LIVE_SAMPLES_BASE_URL, INTERACTIVE_EXAMPLES_BASE_URL };
