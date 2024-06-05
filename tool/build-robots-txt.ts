/**
 * This script generates a /robots.txt file that depends on
 * process.env.BUILD_ALWAYS_ALLOW_ROBOTS.
 *
 */
import fs from "node:fs";

import { ALWAYS_ALLOW_ROBOTS } from "../libs/env/index.js";

const ALLOW_TEXT = `
User-agent: *
Sitemap: https://developer.mozilla.org/sitemap.xml

Disallow: /api/
Disallow: /*/contributors.txt
Disallow: /*/files/
Disallow: /media
`;

const DISALLOW_TEXT = `
User-Agent: *

Disallow: /
`;

export async function runBuildRobotsTxt(outfile: string) {
  const content = ALWAYS_ALLOW_ROBOTS ? ALLOW_TEXT : DISALLOW_TEXT;
  fs.writeFileSync(outfile, `${content.trim()}\n`, "utf-8");
}
