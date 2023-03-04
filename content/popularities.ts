import fs from "node:fs";

// Module-level cache
const popularities = new Map<string, number>();

export function getPopularities() {
  if (!popularities.size) {
    // This is the file that's *not* checked into git.
    const filePath = new URL("../popularities.json", import.meta.url);
    Object.entries(JSON.parse(fs.readFileSync(filePath, "utf-8"))).forEach(
      ([url, value]: [string, unknown]) => {
        popularities.set(url, value as number);
      }
    );
  }
  return popularities;
}
