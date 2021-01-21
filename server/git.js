const path = require("path");

const {
  CONTENT_ROOT,
  CONTENT_TRANSLATED_ROOT,
  execGit,
  Document,
} = require("../content");

const MAX_DIFF_DOCUMENTS = 25;

module.exports = (req, res) => {
  const locale = req.query.locale.toLowerCase();
  if (!locale) {
    return res.status(400).send("'locale' is always required");
  }

  const root =
    locale.toLowerCase() === "en-us" ? CONTENT_ROOT : CONTENT_TRANSLATED_ROOT;
  if (!root) {
    return res.status(400).send(`No root for locale ${locale}`);
  }

  // Using `git branch --show-current` returns nothing when you're in a
  // detached HEAD. But if we instead using simple `git branch` and look
  // for the line prefixed with a `*` you'll get a sufficient
  // description of the detached HEAD.
  const currentBranch = execGit(["branch"], {}, root)
    .split("\n")
    .find((line) => line.startsWith("*"))
    .replace(/\*\s/, "");

  const diffCommandStart =
    currentBranch === "main" ? ["diff"] : ["diff", "main..."];

  const diffDocuments = [];
  let diffDocumentsCount = 0;
  const diffStats = execGit([...diffCommandStart, "--stat=1000"], {}, root)
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  const diffStatsMap = new Map(
    diffStats
      .split("\n")
      .filter((line) => line.includes("|"))
      .map((line) => line.split("|").map((x) => x.trim()))
  );

  const diffFiles = execGit([...diffCommandStart, "--name-only"], {}, root)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const diffFile of diffFiles) {
    if (diffFile.split(path.sep)[0] === "files") {
      const folderPath = path.dirname(
        diffFile.split(path.sep).slice(1).join(path.sep)
      );
      const document = Document.read(folderPath);
      if (document) {
        if (diffDocuments.length < MAX_DIFF_DOCUMENTS) {
          diffDocuments.push({
            url: document.url,
            title: document.metadata.title,
            stats: diffStatsMap.get(diffFile) || "",
          });
        }
      } else {
        console.warn(`Unable to find document from path ${diffFile}`);
      }
      diffDocumentsCount++;
    } else {
      console.warn(`Expected diffFile to start with 'files' (not ${diffFile})`);
    }
  }

  res.json({
    diffDocuments,
    diffDocumentsCount,
    diffStats,
    currentBranch,
  });
};
