/**
 * The purpose of these routes is to respond with a JSON payload on
 * requests that come in to localhost:5042/api/v1/*
 *
 * You can read more about it in the docs/proxying.md document.
 */

import fs from "node:fs/promises";
import path from "node:path";

import express from "express";
import fse from "fs-extra";

const router = express();

router.get("*", async (req, res) => {
  const folder = path.resolve("./fake-v1-api");
  if (!(await fse.pathExists(folder))) {
    throw new Error(
      `If you're going to fake v1 API requests you have to create the folder: ${folder}`
    );
  }
  const filepath = path.join(folder, `${req.url.slice(1)}.json`);

  if (await fse.pathExists(filepath)) {
    const payload = await fs.readFile(filepath, "utf-8");
    res.json(JSON.parse(payload));
  } else {
    console.warn(`Tried to fake ${req.url} but ${filepath} doesn't exist.`);
    res.status(404).json({ folder, filepath });
  }
});

export default router;
