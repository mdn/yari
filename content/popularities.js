const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT } = require("./constants");

// Module-level cache
const popularities = new Map();

function getPopularities() {
  if (!popularities.size) {
    Object.entries(
      JSON.parse(
        fs.readFileSync(path.join(CONTENT_ROOT, "popularities.json"), "utf-8")
      )
    ).forEach(([url, value]) => {
      popularities.set(url, value);
    });
  }
  return popularities;
}

module.exports = { getPopularities };
