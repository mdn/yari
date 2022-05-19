// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// Module-level cache
const wikiHistoryMaps = new Map();

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getWikiHis... Remove this comment to see the full error message
function getWikiHistories(root, locale) {
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

module.exports = { getWikiHistories };
