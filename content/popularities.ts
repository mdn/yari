import fs from "node:fs";

// Module-level cache
const popularities = new Map<string, number>();

export function getPopularities() {
  if (!popularities.size) {
    // This is the file that's *not* checked into git.
    const filePath = new URL("../popularities.json", import.meta.url);
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!("popularities" in json)) {
      throw Error("run: yarn tool popularities --refresh");
    }
    Object.entries(json.popularities).forEach(
      ([url, value]: [string, unknown]) => {
        popularities.set(url, value as number);
      }
    );
  }
  return popularities;
}
