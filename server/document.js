const express = require("express");

const { Document } = require("../content");
const { buildDocument } = require("../build");

const router = express();

router.post("/", (req, res) => {
  const { rawHTML, metadata } = req.body;
  Document.create(rawHTML, metadata);
  res.sendStatus(201);
});

function withDocument(req, res, next) {
  if (!req.query.url) {
    return res.status(400).send("No ?url= query param");
  }
  const document = Document.findByURL(req.query.url.toLowerCase());
  if (!document) {
    return res.status(404).send(`No document by the URL ${req.query.url}`);
  }
  req.document = document;
  next();
}

router.put("/fixfixableflaws", withDocument, async (req, res) => {
  if (req.document.isArchive) {
    return res.status(400).send("Can't fix archived documents");
  }
  // To get the 'doc' we have to find the built art
  await buildDocument(req.document, {
    fixFlaws: true,
    fixFlawsVerbose: true,
  });
  res.sendStatus(200);
});

router.get("/", withDocument, (req, res) => {
  res.json(req.document);
});

router.put("/", withDocument, async (req, res) => {
  const { rawHTML, metadata } = req.body;
  if (metadata.title && rawHTML) {
    Document.update(
      req.document.fileInfo.folder,
      rawHTML.trim() + "\n",
      metadata
    );
  }
  res.sendStatus(200);
});

router.delete("/", withDocument, (req, res) => {
  Document.del(req.document.fileInfo.folder);
  res.sendStatus(200);
});

module.exports = router;
