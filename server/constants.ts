// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

const dirname = __dirname;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'STATIC_ROO... Remove this comment to see the full error message
const STATIC_ROOT =
  process.env.SERVER_STATIC_ROOT || path.join(dirname, "../client/build");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'PROXY_HOST... Remove this comment to see the full error message
const PROXY_HOSTNAME =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'CONTENT_HO... Remove this comment to see the full error message
const CONTENT_HOSTNAME = process.env.SERVER_CONTENT_HOST;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'OFFLINE_CO... Remove this comment to see the full error message
const OFFLINE_CONTENT = process.env.SERVER_OFFLINE_CONTENT === "true";

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'FAKE_V1_AP... Remove this comment to see the full error message
const FAKE_V1_API = JSON.parse(process.env.SERVER_FAKE_V1_API || false);

module.exports = {
  CONTENT_HOSTNAME,
  OFFLINE_CONTENT,
  STATIC_ROOT,
  PROXY_HOSTNAME,
  FAKE_V1_API,
};
