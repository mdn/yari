import fs from "node:fs";
import path from "node:path";
import { Commit, readGitHistory } from "../build/git-history.js";

// Module-level cache
const gitHistoryMaps = new Map<string, Map<string, Commit>>();

export function getGitHistories(root: string, locale: string) {
  const localeLC = locale.toLowerCase();
  const folder = path.join(root, localeLC);
  if (!gitHistoryMaps.has(folder)) {
    const historyFilePath = path.join(folder, "_githistory.json");
    const history = fs.existsSync(historyFilePath)
      ? new Map(
          Object.entries(readGitHistory(historyFilePath)).map(
            ([filePath, history]) => {
              return [filePath, history];
            }
          )
        )
      : new Map();
    gitHistoryMaps.set(folder, history);
  }
  return gitHistoryMaps.get(folder);
}
