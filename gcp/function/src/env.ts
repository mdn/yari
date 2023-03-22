import type express from "express";
import dotenv from "dotenv";
import * as path from "node:path";
import { cwd } from "node:process";

dotenv.config({
  path: path.join(cwd(), process.env["ENV_FILE"] || ".env"),
});

export enum Origin {
  main = "main",
  liveSamples = "liveSamples",
  unsafe = "unsafe",
}

export enum Source {
  content = "content",
  liveSamples = "liveSamples",
  bcdApi = "bcdApi",
  rumba = "rumba",
}

export const ORIGIN_MAIN: string =
  process.env["ORIGIN_MAIN"] || "developer.mozilla.org";
export const ORIGIN_LIVE_SAMPLES: string =
  process.env["ORIGIN_LIVE_SAMPLES"] || "yari-demos.prod.mdn.mozit.cloud";

export function origin(req: express.Request): Origin {
  switch (req.hostname) {
    case ORIGIN_MAIN:
      return Origin.main;
    case ORIGIN_LIVE_SAMPLES:
      return Origin.liveSamples;
    default:
      return Origin.unsafe;
  }
}

export const SOURCE_CONTENT: string =
  process.env["SOURCE_CONTENT"] || "https://developer.mozilla.org";
export const SOURCE_LIVE_SAMPLES: string =
  process.env["SOURCE_LIVE_SAMPLES"] ||
  "https://yari-demos.prod.mdn.mozit.cloud";
export const SOURCE_BCD_API: string =
  process.env["SOURCE_BCD_API"] || "https://bcd.developer.mozilla.org";
export const SOURCE_RUMBA: string =
  process.env["SOURCE_RUMBA"] || "https://developer.mozilla.org";

export function sourceUri(source: Source): string {
  switch (source) {
    case Source.content:
      return SOURCE_CONTENT;
    case Source.bcdApi:
      return SOURCE_BCD_API;
    case Source.liveSamples:
      return SOURCE_LIVE_SAMPLES;
    case Source.rumba:
      return SOURCE_RUMBA;
    default:
      return "";
  }
}

// Kevel.
export const KEVEL_SITE_ID = Number(process.env["KEVEL_SITE_ID"] ?? 0);
export const KEVEL_NETWORK_ID = Number(process.env["KEVEL_NETWORK_ID"] ?? 0);
export const SIGN_SECRET = process.env["SIGN_SECRET"] ?? "";
export const CARBON_ZONE_KEY = process.env["CARBON_ZONE_KEY"] ?? "";
export const CARBON_FALLBACK_ENABLED = Boolean(
  JSON.parse(process.env["CARBON_FALLBACK_ENABLED"] || "false")
);
