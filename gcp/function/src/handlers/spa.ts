import type express from "express";
import * as path from "node:path";
import { slugToFolder } from "@yari-internal/slug-utils";
import { withResponseHeaders } from "../headers.js";

export async function spa(req: express.Request, res: express.Response) {
  const rPath = req.path;
  const folderName = slugToFolder(rPath);
  let filePath = path.join("/tmp/bar/", folderName);
  if (path.extname(filePath) === "") {
    filePath = path.join(filePath, "index.html");
  }
  return withResponseHeaders(res, { csp: true, xFrame: true }).sendFile(
    filePath
  );
}
