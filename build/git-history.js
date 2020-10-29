const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT, execGit } = require("../content");

function getFromGit() {
  const repoRoot = execGit(["rev-parse", "--show-toplevel"], {
    cwd: CONTENT_ROOT,
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
    }
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
      map.set(line, date);
    }
  }
  return map;
}
function gather(outputfile, previousfile = null) {
  // Every key in this map
  const map = getFromGit();
  for (const [key, date] of map) {
    if (!key.includes("files/en-us/")) console.log({ key, date });
    // console.log({ key, date });
  }
}

module.exports = {
  gather,
};
