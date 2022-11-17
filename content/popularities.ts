import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
