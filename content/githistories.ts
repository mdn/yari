const fs = require("fs");
const path = require("path");

// Module-level cache
const gitHistoryMaps = new Map();

function getGitHistories(root, locale) {
  const localeLC = locale.toLowerCase();
  const folder = path.join(root, localeLC);
  if (!gitHistoryMaps.has(folder)) {
    const historyFilePath = path.join(folder, "_githistory.json");
    const history = fs.existsSync(historyFilePath)
      ? new Map(
          Object.entries(JSON.parse(fs.readFileSync(historyFilePath))).map(
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

module.exports = { getGitHistories };
