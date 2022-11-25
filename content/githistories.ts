import fs from "node:fs";
import path from "node:path";

// Module-level cache
const gitHistoryMaps = new Map();

export function getGitHistories(root: string, locale: string) {
  const localeLC = locale.toLowerCase();
  const folder = path.join(root, localeLC);
  if (!gitHistoryMaps.has(folder)) {
    const historyFilePath = path.join(folder, "_githistory.json");
    const history = fs.existsSync(historyFilePath)
      ? new Map(
          Object.entries(
            JSON.parse(fs.readFileSync(historyFilePath).toString())
          ).map(([filePath, history]) => {
            return [filePath, history];
          })
        )
      : new Map();
    gitHistoryMaps.set(folder, history);
  }
  return gitHistoryMaps.get(folder);
}
