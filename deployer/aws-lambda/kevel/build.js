import fs from "node:fs";
const KEVEL_SITE_ID = process.env.KEVEL_SITE_ID;
const KEVEL_NETWORK_ID = process.env.KEVEL_NETWORK_ID;

fs.writeFileSync(
  "env.js",
  `export const KEVEL_SITE_ID = ${KEVEL_SITE_ID};\nexport const KEVEL_NETWORK_ID = ${KEVEL_NETWORK_ID};\n`
);
