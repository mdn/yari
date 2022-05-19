// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// Module-level cache
const gitHistoryMaps = new Map();

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getGitHist... Remove this comment to see the full error message
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
