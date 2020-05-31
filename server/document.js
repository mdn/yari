const fs = require("fs");
const path = require("path");

const express = require("express");

const Document = require("content/scripts/document");

const { STATIC_ROOT } = require("./constants");
const { getOrCreateBuilder, normalizeContentPath } = require("./utils");

const CONTENT_ROOT = path.join("..", process.env.BUILD_ROOT);

const router = express();

function addToBuilder(localeFolder, slug) {
  const builder = getOrCreateBuilder();
  builder.ensureAllTitles();
  const source = builder.sources.entries()[0];
  const folder = Document.buildPath(localeFolder, slug);
  builder.processFolderTitle(source, folder, []);
  return builder.processFolder(source, folder);
}

router.post("/", (req, res) => {
  const { rawHtml, metadata } = req.body;
  const localeFolder = path.join(CONTENT_ROOT, metadata.locale.toLowerCase());
  Document.create(localeFolder, rawHtml, metadata);

  addToBuilder(localeFolder, metadata.slug)
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
  const document = Document.read(CONTENT_ROOT, req.docFolder);
  res.status(document ? 200 : 404).json(document);
});

router.put("/", withDocFolder, (req, res) => {
  const { rawHtml, metadata } = req.body;
  if (metadata.title && rawHtml) {
    const document = Document.read(CONTENT_ROOT, req.docFolder);
    Document.update(
      CONTENT_ROOT,
      req.docFolder,
      rawHtml.trim() + "\n",
      metadata
    );
    const oldMetadata = document.metadata;
    if (oldMetadata.slug !== metadata.slug) {
      const builder = getOrCreateBuilder();
      builder.removeFolderTitle(oldMetadata.locale, oldMetadata.slug);
      builder.moveSlug(
        CONTENT_ROOT,
        metadata.locale,
        oldMetadata.slug,
        metadata.slug,
        { redirectOldToNew: true }
      );

      addToBuilder(
        path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
        metadata.slug
      )
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          console.error("Error while adding new folder to builder index", e);
          res.sendStatus(500);
        });
      return;
    }
  }
  res.sendStatus(200);
});

router.delete("/", withDocFolder, (req, res) => {
  const { metadata } = Document.read(CONTENT_ROOT, req.docFolder);
  Document.del(req.docFolder);
  getOrCreateBuilder().removeFolderTitle(metadata.locale, metadata.slug);

  const builtFile = path.join(
    STATIC_ROOT,
    req.query.url.toLowerCase(),
    "index.json"
  );
  if (fs.existsSync(builtFile)) {
    fs.unlinkSync(builtFile);
  }
  res.sendStatus(200);
});

module.exports = router;
