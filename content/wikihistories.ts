import fs from "node:fs";
import path from "node:path";

type WikiHistory = {
  modified: string; // ISO 8601 format
  contributors: string[];
};

// Module-level cache
const wikiHistoryMaps = new Map<string, Map<string, WikiHistory>>();

export function getWikiHistories(root: string, locale: string) {
  const localeLC = locale.toLowerCase();
  const folder = path.join(root, localeLC);
  if (!wikiHistoryMaps.has(folder)) {
    const historyFilePath = path.join(folder, "_wikihistory.json");
    const history = fs.existsSync(historyFilePath)
      ? new Map(
          Object.entries(
            JSON.parse(fs.readFileSync(historyFilePath, "utf-8"))
          ).map(([slug, history]) => {
            return [`/${locale}/docs/${slug}`, history];
          })
        )
      : new Map();
    wikiHistoryMaps.set(folder, history);
  }
  return wikiHistoryMaps.get(folder);
}
