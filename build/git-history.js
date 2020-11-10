const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT, execGit } = require("../content");

function getFromGit(contentRoot = CONTENT_ROOT) {
  const repoRoot = execGit(["rev-parse", "--show-toplevel"], {
    cwd: contentRoot,
  });

  const MARKER = "COMMIT:";
  const output = execGit(
    [
      "log",
      "--name-only",
      "--no-decorate",
      `--format=${MARKER}%cI`,
      "--date-order",
      "--reverse",
    ],
    {
      cwd: repoRoot,
    },
    repoRoot
  );

  const map = new Map();
  let date = null;
  for (let line of output.split("\n")) {
    // Happens to file paths that contain non-ascii or control charaters.
    // E.g. "files/en-us/glossary/b\303\251zier_curve/index.html"
    if (line.startsWith('"') && line.endsWith('"')) {
      line = line.slice(1, -1);
    }
    if (line.startsWith(MARKER)) {
      date = new Date(line.replace(MARKER, ""));
    } else if (line) {
      const relPath = path.relative(contentRoot, path.join(repoRoot, line));
      map.set(relPath, date);
    }
  }
  return map;
}

function gather(contentRoot, previousFile = null) {
  const map = new Map();
  if (previousFile) {
    const previous = JSON.parse(fs.readFileSync(previousFile, "utf-8"));
    for (const [key, value] of Object.entries(previous)) {
      map.set(key, value);
    }
  }
  // Every key in this map is a path, relative to CONTENT_ROOT.
  for (const [key, value] of getFromGit(contentRoot)) {
    // Because CONTENT_ROOT isn't necessarily the same as the path relative to
    // the git root. For example "../README.md" and since those aren't documents
    // exclude them.
    // We also only care about documents.
    if (
      !key.startsWith(".") &&
      (key.endsWith("index.html") || key.endsWith("index.md"))
    ) {
      map.set(key, {
        modified: value,
      });
    }
  }
  return map;
}

module.exports = {
  gather,
};
