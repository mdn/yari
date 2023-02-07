import fs from "node:fs";
const KEVEL_SITE_ID = process.env.KEVEL_SITE_ID;
const KEVEL_NETWORK_ID = process.env.KEVEL_NETWORK_ID;
const SIGN_SECRET = process.env.SIGN_SECRET;
const CARBON_ZONE_KEY = process.env.CARBON_ZONE_KEY;
const CARBON_FALLBACK_ENABLED = Boolean(
  JSON.parse(process.env.CARBON_FALLBACK_ENABLED || "false")
);

fs.writeFileSync(
  "env.js",
  `// generated
export const KEVEL_SITE_ID = ${KEVEL_SITE_ID};
export const KEVEL_NETWORK_ID = ${KEVEL_NETWORK_ID};
export const SIGN_SECRET = "${SIGN_SECRET}";
export const CARBON_ZONE_KEY = "${CARBON_ZONE_KEY}";
export const FALLBACK_ENABLED = ${CARBON_FALLBACK_ENABLED};
`
);
