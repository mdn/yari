import fs from "node:fs";
import path from "node:path";

import { execGit } from "../content/index.js";
import { CONTENT_ROOT } from "../libs/env/index.js";

export type Commit = {
  modified: string; // ISO 8601 format
  hash: string;
};

interface CommitHistory {
  [filePath: string]: Commit;
}

function getFromGit(contentRoot = CONTENT_ROOT) {
  // If `contentRoot` was a symlink, the `repoRoot` won't be. That'll make it
  // impossible to compute the relative path for files within when we get
  // output back from `git log ...`.
  // So, always normalize to the real path.
  const realContentRoot = fs.realpathSync(contentRoot);

  const repoRoot = execGit(["rev-parse", "--show-toplevel"], {
    cwd: realContentRoot,
  });

  const MARKER = "COMMIT:";
  const DELIMITER = "_";
  const output = execGit(
    [
      "log",
      "--name-only",
      "--no-decorate",
      `--format=${MARKER}%H${DELIMITER}%cI`,
      "--date-order",
      "--reverse",
      // use the merge commit's date, as this is the date the content can
      // be built and deployed. And such behavior is similar to
      // GitHub's "Squash and merge" option.
      "--first-parent",
      // "Separate the commits with NULs instead of with new newlines."
      // So each line isn't, possibly, wrapped in "quotation marks".
      // Now we just need to split the output, as a string, by \0.
      "-z",
    ],
    {
      cwd: repoRoot,
    },
    repoRoot
  );

  const map = new Map<string, Commit>();
  let date: string = null;
  let hash: string = null;
  // Even if we specified the `-z` option to `git log ...` above, sometimes
  // it seems `git log` prefers to use a newline character.
  // At least as of git version 2.28.0 (Dec 2020). So let's split on both
  // characters to be safe.
  for (const line of output.split(/\0|\n/)) {
    if (line.startsWith(MARKER)) {
      const [hashStr, dateStr] = line.replace(MARKER, "").split(DELIMITER);
      hash = hashStr;
      date = new Date(dateStr).toISOString();
    } else if (line) {
      const relPath = path.relative(realContentRoot, path.join(repoRoot, line));
      map.set(relPath, { modified: date, hash });
    }
  }
  return map;
}

// Read the git history from the specified file.
// If the file doesn't exist, return an empty object.
export function readGitHistory(historyFilePath: string): CommitHistory {
  if (fs.existsSync(historyFilePath)) {
    return JSON.parse(fs.readFileSync(historyFilePath, "utf-8"));
  }
  return {};
}

export function gather(contentRoots: string[], previousFile: string = null) {
  const map = new Map<string, Commit>();
  if (previousFile) {
    const previous = readGitHistory(previousFile);
    for (const [key, value] of Object.entries(previous)) {
      map.set(key, value);
    }
  }
  // Every key in this map is a path, relative to root.
  for (const contentRoot of contentRoots) {
    const commits = getFromGit(contentRoot);
    for (const [key, value] of commits) {
      // Because CONTENT_*_ROOT isn't necessarily the same as the path relative to
      // the git root. For example "../README.md" and since those aren't documents
      // exclude them.
      // We also only care about existing documents.
      if (
        !key.startsWith(".") &&
        (key.endsWith("index.html") || key.endsWith("index.md")) &&
        fs.existsSync(path.join(contentRoot, key))
      ) {
        map.set(key, value);
      }
    }
  }
  return map;
}
