import fs from "node:fs";
import path from "node:path";

import express, { Request } from "express";

import { Document, slugToFolder } from "../content/index.js";
import { buildDocument } from "../build/index.js";
import { BUILD_OUT_ROOT } from "../libs/env/index.js";
import { Doc } from "../libs/types/document.js";

const router = express();

// XXX deprecated anyway and doesn't work with Markdown
// router.post("/", (req, res) => {
//   const { rawHTML, metadata } = req.body;
//   Document.create(rawHTML, metadata);
//   res.sendStatus(201);
// });

interface RequestWithDocument extends Request {
  document: Partial<Doc & { url: string }>;
}

function withDocument(req: RequestWithDocument, res, next) {
  if (!req.query.url) {
    return res.status(400).send("No ?url= query param");
  }
  const document = Document.findByURL((req.query.url as string).toLowerCase());
  if (!document) {
    return res.status(404).send(`No document by the URL ${req.query.url}`);
  }
  req.document = document;
  next();
}

router.put(
  "/fixfixableflaws",
  withDocument,
  async (req: RequestWithDocument, res) => {
    // To get the 'doc' we have to find the built art
    try {
      await buildDocument(req.document, {
        fixFlaws: true,
        fixFlawsVerbose: true,
      });
    } catch (error) {
      console.error(`Error in buildDocument(${req.document.url})`, error);
      return res.status(500).send(error.toString());
    }

    // Just because you *build* document, doesn't mean it writes the new
    // built content to disk. So, if *was* already built, with all the flaws
    // in place, it won't be written to disk until you use the build CLI next.
    // Also, when viewing documents it will fetch the `./index.json` on the
    // fly and if it's already present on disk it won't refresh from the
    // server dynamically. So, delete any possible copies of this from disk.
    const outPath = path.join(BUILD_OUT_ROOT, slugToFolder(req.document.url));
    if (fs.existsSync(path.join(outPath, "index.html"))) {
      fs.unlinkSync(path.join(outPath, "index.html"));
    }
    if (fs.existsSync(path.join(outPath, "index.json"))) {
      fs.unlinkSync(path.join(outPath, "index.json"));
    }

    res.sendStatus(200);
  }
);

router.get("/", withDocument, (req: RequestWithDocument, res) => {
  res.json(req.document);
});

router.put("/", withDocument, async (req: RequestWithDocument, res) => {
  const { rawBody, metadata } = req.body;
  if (metadata.title && rawBody) {
    await Document.update(req.document.url, `${rawBody.trim()}\n`, metadata);
  }
  res.sendStatus(200);
});

// XXX deprecated anyway and doesn't work with Markdown
// router.put("/move", async (req, res) => {
//   Document.move(req.query.slug, req.query.newSlug, req.query.locale);
//   res.sendStatus(200);
// });

router.delete("/", async (req, res) => {
  await Document.remove(req.query.slug as string, req.query.locale as string, {
    recursive: true,
  });
  res.sendStatus(200);
});

export default router;
