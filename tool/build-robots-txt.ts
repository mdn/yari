/**
 * This script generates a /robots.txt file that depends on
 * process.env.BUILD_ALWAYS_ALLOW_ROBOTS.
 *
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'VALID_LOCA... Remove this comment to see the full error message
const { VALID_LOCALES } = require("../libs/constants");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ALWAYS_ALL... Remove this comment to see the full error message
const { ALWAYS_ALLOW_ROBOTS } = require("../build/constants");

const ALLOW_TEXT = `
User-agent: *
Sitemap: https://developer.mozilla.org/sitemap.xml

Disallow: /api/
Disallow: /*/files/
Disallow: /media
`;

const DISALLOW_TEXT = `
User-Agent: *

Disallow: /
`;

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'runBuildRo... Remove this comment to see the full error message
async function runBuildRobotsTxt(outfile) {
  let content = ALWAYS_ALLOW_ROBOTS ? ALLOW_TEXT : DISALLOW_TEXT;
  if (ALWAYS_ALLOW_ROBOTS) {
    // Append extra lines specifically when we do allow robots.
    for (const locale of VALID_LOCALES.values()) {
      content += `Disallow: /${locale}/search\n`;
    }
  }
  fs.writeFileSync(outfile, `${content.trim()}\n`, "utf-8");
}

module.exports = { runBuildRobotsTxt };
