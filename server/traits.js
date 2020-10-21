const fs = require("fs");
const path = require("path");

const express = require("express");

const { Document } = require("../content");
const { analyzeDocument } = require("../build");
const { normalizeMacroName } = require("../kumascript/src/render.js");

const MACROS_ROOT = path.join(__dirname, "..", "kumascript", "macros");
console.assert(fs.existsSync(MACROS_ROOT), `${MACROS_ROOT} does not exist`);

const router = express();

let _cachedAnalyzedDocuments = null;

router.get("/", async (req, res) => {
  const metadata = {};
  const t0 = new Date();
  try {
    const documents = _cachedAnalyzedDocuments
      ? _cachedAnalyzedDocuments
      : await analyzeDocuments();
    _cachedAnalyzedDocuments = documents;
    // const documents = await analyzeDocuments();
    const allMacros = getAllMacros(documents);
    const t1 = new Date();
    metadata.tookSeconds = (t1 - t0) / 1000;
    metadata.count = documents.length;
    res.json({
      documents,
      metadata,
      allMacros,
      fromCache: !!_cachedAnalyzedDocuments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.toString());
  }
});

function getAllMacros(documents) {
  const counts = new Map();
  documents.forEach((document) => {
    Object.entries(document.normalizedMacrosCount).forEach(([name, count]) => {
      counts.set(name, (counts.get(name) || 0) + count);
    });
  });

  const root = MACROS_ROOT;
  const files = fs.readdirSync(root);
  const allMacros = [];
  for (const name of files) {
    const filepath = path.join(root, name);
    if (name.endsWith(".ejs") && !fs.statSync(filepath).isDirectory()) {
      const sourceName = name.replace(/\.ejs$/, "");
      const normalizedName = normalizeMacroName(sourceName);
      totalCount = counts.get(normalizedName) || 0;
      allMacros.push({
        sourceName,
        normalizedName,
        totalCount,
      });
    }
  }
  return allMacros;
}

async function analyzeDocuments() {
  const documents = Document.findAll();
  if (!documents.count) {
    throw new Error("No documents to build found");
  }

  const docs = [];
  for (const document of documents.iter()) {
    document.noIndexing =
      (document.isArchive && !document.isTranslated) ||
      document.metadata.slug === "MDN/Kitchensink";
    if (document.noIndexing) {
      continue;
    }

    docs.push(await analyzeDocument(document));
  }

  return docs;
}

module.exports = router;
