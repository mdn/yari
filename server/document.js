const fs = require("fs");
const path = require("path");

const express = require("express");

const Document = require("content/scripts/document");

const { STATIC_ROOT } = require("./constants");
const { builder, normalizeContentPath } = require("./builder");

const CONTENT_ROOT = path.join("..", process.env.BUILD_ROOT);

const router = express();

function addToBuilder(localeFolder, slug) {
  builder.ensureAllTitles();
  const source = builder.sources.entries()[0];
  const folder = Document.buildPath(localeFolder, slug);
  try {
    builder.processFolderTitle(source, folder, []);
  } catch (e) {
    throw new Error(`Error when processing ${folder}: ${e.toString()}`);
  }
  return builder.processFolder(source, folder);
}

router.post("/", (req, res) => {
  const { rawHtml, metadata } = req.body;
  const localeFolder = path.join(CONTENT_ROOT, metadata.locale.toLowerCase());
  Document.create(localeFolder, rawHtml, metadata);

  addToBuilder(localeFolder, metadata.slug)
    .then(() => {
      builder.dumpAllTitles();
      builder.dumpAllURLs();
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
  const docData = builder.allTitles.get(mdn_url);
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

function removeBuiltFiles(url) {
  const jsonPath = path.join(STATIC_ROOT, url.toLowerCase(), "index.json");
  if (fs.existsSync(jsonPath)) {
    fs.unlinkSync(jsonPath);
  }
  const htmlPath = path.join(STATIC_ROOT, url.toLowerCase(), "index.html");
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}

router.put("/", withDocFolder, async (req, res) => {
  const { rawHtml, metadata } = req.body;
  if (metadata.title && rawHtml) {
    const document = Document.read(CONTENT_ROOT, req.docFolder);
    const oldMetadata = document.metadata;
    const oldSlug = oldMetadata.slug;
    const newSlug = metadata.slug;
    const isNewSlug = oldSlug !== newSlug;

    if (isNewSlug) {
      for (const watcher of builder.watchers) {
        await watcher.close();
      }
    }

    Document.update(
      CONTENT_ROOT,
      req.docFolder,
      rawHtml.trim() + "\n",
      metadata
    );

    if (isNewSlug) {
      const oldSlugs = builder.removeURLs(oldMetadata.locale, oldSlug);
      const changedSlugs = oldSlugs.map((slug) => [
        slug,
        slug.replace(oldSlug, newSlug),
      ]);
      Promise.all(
        changedSlugs.map(([oldSlug, newSlug]) =>
          addToBuilder(
            path.join(CONTENT_ROOT, metadata.locale.toLowerCase()),
            newSlug
          )
        )
      )
        .then(() => {
          builder.dumpAllTitles();
          builder.dumpAllURLs();
          builder.moveURLs(CONTENT_ROOT, metadata.locale, changedSlugs);
          builder.watch();
          removeBuiltFiles(req.query.url);
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
  builder.removeURLs(metadata.locale, metadata.slug);
  builder.dumpAllTitles();
  builder.dumpAllURLs();

  removeBuiltFiles(req.query.url);

  res.sendStatus(200);
});

module.exports = router;
