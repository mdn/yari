const path = require("path");

const express = require("express");

const { Document } = require("content");

const router = express();

router.post("/", (req, res) => {
  const { rawHtml, metadata } = req.body;
  Document.create(rawHtml, metadata);
  res.sendStatus(201);
});

function withDocument(req, res, next) {
  if (!req.query.url) {
    return res.status(400).send("No ?url= query param");
  }
  const result = Document.findByURL(req.query.url.toLowerCase());
  if (!result) {
    return res.status(404).send(`No document by the URL ${req.query.url}`);
  }
  req.document = result.document;
  next();
}

router.get("/", withDocument, (req, res) => {
  res.json(req.document);
});

router.put("/", withDocument, async (req, res) => {
  const { rawHtml, metadata } = req.body;
  if (metadata.title && rawHtml) {
    Document.update(
      path.dirname(req.document.fileInfo.path),
      rawHtml.trim() + "\n",
      metadata
    );
  }
  res.sendStatus(200);
});

router.delete("/", withDocument, (req, res) => {
  Document.del(path.dirname(req.document.fileInfo.path));
  res.sendStatus(200);
});

module.exports = router;
