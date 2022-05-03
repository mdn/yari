import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Module-level cache
const popularities = new Map();

function getPopularities() {
  if (!popularities.size) {
    // This is the file that's *not* checked into git.
    const filePath = path.resolve(
      path.join(dirname, "..", "popularities.json")
    );
    Object.entries(JSON.parse(fs.readFileSync(filePath, "utf8"))).forEach(
      ([url, value]) => {
        popularities.set(url, value);
      }
    );
  }
  return popularities;
}

export { getPopularities };
