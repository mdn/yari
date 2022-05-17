const fs = require("fs");
const path = require("path");

// Module-level cache
const wikiHistoryMaps = new Map();

export function getWikiHistories(root, locale) {
  const localeLC = locale.toLowerCase();
  const folder = path.join(root, localeLC);
  if (!wikiHistoryMaps.has(folder)) {
    const historyFilePath = path.join(folder, "_wikihistory.json");
    const history = fs.existsSync(historyFilePath)
      ? new Map(
          Object.entries(JSON.parse(fs.readFileSync(historyFilePath))).map(
            ([slug, history]) => {
              return [`/${locale}/docs/${slug}`, history];
            }
          )
        )
      : new Map();
    wikiHistoryMaps.set(folder, history);
  }
  return wikiHistoryMaps.get(folder);
}
