// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

const dirname = __dirname;

// Module-level cache
const popularities = new Map();

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getPopular... Remove this comment to see the full error message
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
