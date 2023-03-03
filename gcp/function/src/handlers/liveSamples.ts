import type express from "express";
import * as path from "node:path";
import { slugToFolder } from "@yari-internal/slug-utils";

export async function liveSamples(req: express.Request, res: express.Response) {
  const rPath = req.path;
  const folderName = slugToFolder(rPath);
  const filePath = path.join("/tmp/231/", folderName);
  res.sendFile(filePath);
}
