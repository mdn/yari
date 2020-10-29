const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const { execGit } = require("../content");

function getFromGit() {
  const output = execGit([
    "log",
    "--name-only",
    "--no-decorate",
    '--format="←→ %ci"',
    "--date-order",
    "--reverse",
  ]);
  const map = new Map();
  output
    .split("←→")
    .slice(1)
    .forEach((commit) => {
      const [date, , ...files] = commit.trim().split("\n");
      const iso = new Date(date).toISOString();
      for (const file of files) {
        map.set(file, iso);
      }
    });
  return map;
}
function gather(outputfile, previousfile = null) {}

module.exports = {
  gather,
};
