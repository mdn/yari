const path = require("path");

const express = require("express");

const Document = require("content/scripts/document");

const { getOrCreateBuilder, normalizeContentPath } = require("./utils");

const router = express();

const getContentRoot = () => path.join("..", process.env.BUILD_ROOT);

router.post("/", (req, res) => {
  const { locale, rawHtml, metadata } = req.body;
  const contentRoot = path.join(getContentRoot(), locale.toLowerCase());
  Document.create(contentRoot, rawHtml, metadata);

  const builder = getOrCreateBuilder();
  builder.ensureAllTitles();
  const source = builder.sources.entries()[0];
  const folder = Document.buildPath(contentRoot, metadata.slug);
  builder.processFolderTitle(source, folder, []);
  builder
    .processFolder(source, folder)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((e) => {
      console.error("Error while adding new folder to builder index", e);
      res.sendStatus(500);
    });
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
  req.docFolder = normalizeContentPath(docData.file);
  next();
}

router.get("/", withDocFolder, (req, res) => {
  const document = Document.read(getContentRoot(), req.docFolder);
  res.status(document ? 200 : 404).json(document);
});

router.put("/", withDocFolder, (req, res) => {
  const { rawHtml, metadata } = req.body;
  if (metadata.title && rawHtml) {
    Document.update(getContentRoot(), req.docFolder, rawHtml.trim() + "\n", {
      title: metadata.title.trim(),
      summary: metadata.summary.trim(),
    });
  }
  res.sendStatus(200);
});

router.delete("/", withDocFolder, (req, res) => {
  const { metadata } = Document.read(getContentRoot(), req.docFolder);
  Document.del(req.docFolder);
  getOrCreateBuilder().removeFolderTitle(metadata.locale, metadata.slug);
  res.sendStatus(200);
});

module.exports = router;
