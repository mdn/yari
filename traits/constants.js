const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", process.env.ENV_FILE || ".env"),
});

const BUILD_OUT_ROOT =
  process.env.BUILD_OUT_ROOT || path.join(__dirname, "analyzed");

module.exports = {
  BUILD_OUT_ROOT,
};
