import fs from "node:fs";
const KEVEL_SITE_ID = process.env.KEVEL_SITE_ID;
const KEVEL_NETWORK_ID = process.env.KEVEL_NETWORK_ID;
const SIGN_SECRET = process.env.SIGN_SECRET;

fs.writeFileSync(
  "env.js",
  `// generated
export const KEVEL_SITE_ID = ${KEVEL_SITE_ID};
export const KEVEL_NETWORK_ID = ${KEVEL_NETWORK_ID};
export const SIGN_SECRET = "${SIGN_SECRET}";
`
);
