import fs from "fs";
import path from "path";

const dirname = fileURLToPath(new URL(".", import.meta.url));

// Module-level cache
const popularities = new Map<string, number>();

export function getPopularities() {
  if (!popularities.size) {
    // This is the file that's *not* checked into git.
    const filePath = path.resolve(
      path.join(dirname, "..", "popularities.json")
    );
    Object.entries(JSON.parse(fs.readFileSync(filePath, "utf-8"))).forEach(
      ([url, value]: [string, number]) => {
        popularities.set(url, value);
      }
    );
  }
  return popularities;
}
