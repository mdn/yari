import { slugToFolder } from "@yari-internal/slug-utils";
import * as path from "node:path";

export function resolveIndexHTML(pathOrUrl: string) {
  let resolvedPath = slugToFolder(pathOrUrl);
  if (path.extname(resolvedPath) === "") {
    resolvedPath = path.join(resolvedPath, "index.html");
  }
  return resolvedPath;
}
