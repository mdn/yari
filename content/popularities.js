const fs = require("fs");
const path = require("path");

const dirname = __dirname;

// Module-level cache
const popularities = new Map();

function getPopularities() {
  if (!popularities.size) {
    // This is the file that's *not* checked into git.
    const filePath = path.resolve(
      path.join(dirname, "..", "popularities.json")
    );
    Object.entries(JSON.parse(fs.readFileSync(filePath, "utf-8"))).forEach(
      ([url, value]) => {
        popularities.set(url, value);
      }
    );
  }
  return popularities;
}

module.exports = { getPopularities };
