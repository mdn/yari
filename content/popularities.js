const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT } = require("./constants");

module.exports = JSON.parse(
  fs.readFileSync(path.join(CONTENT_ROOT, "popularities.json"), "utf-8")
);
