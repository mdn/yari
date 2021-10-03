const path = require("path");
require("dotenv");

const STATIC_ROOT =
  process.env.SERVER_STATIC_ROOT || path.join(__dirname, "../client/build");
const PROXY_HOSTNAME =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";

const FAKE_V1_API = JSON.parse(process.env.SERVER_FAKE_V1_API || false);

module.exports = { STATIC_ROOT, PROXY_HOSTNAME, FAKE_V1_API };
