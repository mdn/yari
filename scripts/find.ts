import { readdir } from "node:fs/promises";
import path from "node:path";

// recursively find directories with specified file in the project
// ignores `node_modules/**`
export async function findDirWithFileRecursive(
  filename: string,
  startDirectory = "."
): Promise<string[]> {
  const directories = [startDirectory];
  const dirPaths = [];
  while (directories.length > 0) {
    const dir = directories.pop();
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const { name, path: entryPath } = entry;
      if (entry.isDirectory() && name !== "node_modules")
        directories.push(path.join(entryPath, name));
      else if (name == filename) dirPaths.push(entryPath);
    }
  }
  return dirPaths;
}
