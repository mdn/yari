/**
 * This script generates a /robots.txt file that depends on
 * process.env.BUILD_ALWAYS_ALLOW_ROBOTS.
 *
 */
const fs = require("fs");

const { ALWAYS_ALLOW_ROBOTS } = require("../build/constants");

const ALLOW_TEXT = `
User-agent: *

Disallow: /api/
`;

const DISALLOW_TEXT = `
User-Agent: *

Disallow: /
`;

async function runBuildRobotsTxt(outfile) {
  const content = ALWAYS_ALLOW_ROBOTS ? ALLOW_TEXT : DISALLOW_TEXT;
  fs.writeFileSync(outfile, `${content.trim()}\n`, "utf-8");
}

module.exports = { runBuildRobotsTxt };
