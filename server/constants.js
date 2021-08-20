import path from "path";
import { fileURLToPath } from "url";

// import dotenv from "dotenv";

// dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const STATIC_ROOT =
  process.env.SERVER_STATIC_ROOT || path.join(__dirname, "../client/build");

export const PROXY_HOSTNAME =
  process.env.REACT_APP_KUMA_HOST || "developer.mozilla.org";

export const FAKE_V1_API = JSON.parse(process.env.SERVER_FAKE_V1_API || false);
