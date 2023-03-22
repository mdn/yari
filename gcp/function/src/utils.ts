import * as path from "node:path";
import type express from "express";
import { slugToFolder } from "@yari-internal/slug-utils";
import { DEFAULT_COUNTRY } from "./constants.js";

export function resolveIndexHTML(pathOrUrl: string) {
  let resolvedPath = slugToFolder(pathOrUrl);
  if (path.extname(resolvedPath) === "") {
    resolvedPath = path.join(resolvedPath, "index.html");
  }
  return resolvedPath;
}

export function getRequestCountry(req: express.Request): string {
  // https://cloud.google.com/appengine/docs/flexible/reference/request-headers#app_engine-specific_headers
  const value = req.headers["x-appengine-country"];

  if (typeof value === "string" && value !== "ZZ") {
    return value;
  } else {
    return DEFAULT_COUNTRY;
  }
}
