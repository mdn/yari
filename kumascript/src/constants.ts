// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'SERVER_POR... Remove this comment to see the full error message
const SERVER_PORT = process.env.SERVER_PORT || 5042;
const SERVER_URL = `http://localhost:${SERVER_PORT}`;

// Allow the `process.env.BUILD_LIVE_SAMPLES_BASE_URL` to be falsy
// if it *is* set.
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'LIVE_SAMPL... Remove this comment to see the full error message
const LIVE_SAMPLES_BASE_URL =
  process.env.BUILD_LIVE_SAMPLES_BASE_URL !== undefined
    ? process.env.BUILD_LIVE_SAMPLES_BASE_URL
    : SERVER_URL;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'INTERACTIV... Remove this comment to see the full error message
const INTERACTIVE_EXAMPLES_BASE_URL =
  process.env.BUILD_INTERACTIVE_EXAMPLES_BASE_URL ||
  "https://interactive-examples.mdn.mozilla.net";

module.exports = { LIVE_SAMPLES_BASE_URL, INTERACTIVE_EXAMPLES_BASE_URL };
