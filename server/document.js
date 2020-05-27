const path = require("path");

const express = require("express");

const Document = require("content/scripts/document");

const { getOrCreateBuilder, normalizeContentPath } = require("./utils");

const router = express();

const getContentRoot = () => path.join("..", process.env.BUILD_ROOT);

router.post("/", (req, res) => {
  const { locale, rawHtml, metadata } = req.body;
  const contentPath = path.join(getContentRoot(), locale.toLowerCase());
  Document.create(contentPath, rawHtml, metadata);
  res.sendStatus(200);
});

function withDocFolder(req, res, next) {
  if (!req.query.url) {
    return res.status(400).send("No ?url= query param");
  }
  const mdn_url = req.query.url.toLowerCase();
  const docData = getOrCreateBuilder().allTitles.get(mdn_url);
  if (!docData) {
    return res.status(400).send(`No document by the URL ${req.query.url}`);
  }
  req.folder = normalizeContentPath(docData.file);
  next();
}

router.get("/", withDocFolder, (req, res) => {
  res.status(200).json(Document.read(getContentRoot(), req.folder));
});

router.put("/", withDocFolder, (req, res) => {
  const { rawHtml, metadata } = req.body;
  if (metadata.title && rawHtml) {
    Document.update(getContentRoot(), req.folder, rawHtml.trim() + "\n", {
      title: metadata.title.trim(),
      summary: metadata.summary.trim(),
    });
  }
  res.sendStatus(200);
});

router.delete("/", withDocFolder, (req, res) => {
  Document.del(req.folder);
  res.sendStatus(200);
});

module.exports = router;
