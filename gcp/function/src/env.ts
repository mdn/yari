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
  interactiveSamples = "interactiveSamples",
  unsafe = "unsafe",
}

export enum RuntimeEnv {
  prod = "prod",
  stage = "stage",
  dev = "dev",
  local = "local",
}

export enum Source {
  content = "content",
  client = "client",
  liveSamples = "liveSamples",
  interactiveSamples = "interactiveSamples",
  bcdApi = "bcdApi",
  bcdUpdates = "bcdUpdates",
  rumba = "rumba",
}

export const RUNTIME_ENV: string = process.env["RUNTIME_ENV"] || "prod";
export const ORIGIN_MAIN: string =
  process.env["ORIGIN_MAIN"] || "developer.mozilla.org";
export const ORIGIN_LIVE_SAMPLES: string =
  process.env["ORIGIN_LIVE_SAMPLES"] || "interactive-examples.mdn.mozilla.net";
export const ORIGIN_INTERACTIVE_SAMPLES: string =
  process.env["ORIGIN_INTERACTIVE_SAMPLES"] ||
  "yari-demos.prod.mdn.mozit.cloud";

export function origin(req: express.Request): Origin {
  switch (req.hostname) {
    case ORIGIN_MAIN:
      return Origin.main;
    case ORIGIN_LIVE_SAMPLES:
      return Origin.liveSamples;
    case ORIGIN_INTERACTIVE_SAMPLES:
      return Origin.interactiveSamples;
    default:
      return Origin.unsafe;
  }
}

export const SOURCE_CONTENT: string =
  process.env["SOURCE_CONTENT"] ||
  process.env["BUILD_OUT_ROOT"] ||
  "https://developer.mozilla.org";
export const SOURCE_LIVE_SAMPLES: string =
  process.env["SOURCE_LIVE_SAMPLES"] ||
  process.env["BUILD_OUT_ROOT"] ||
  "https://yari-demos.prod.mdn.mozit.cloud";
export const SOURCE_BCD_API: string =
  process.env["SOURCE_BCD_API"] || "https://developer.mozilla.org";
export const SOURCE_CLIENT: string =
  process.env["SOURCE_CLIENT"] || "https://developer.mozilla.org";
export const SOURCE_RUMBA: string =
  process.env["SOURCE_RUMBA"] || "https://developer.mozilla.org";

export function sourceUri(source: Source): string {
  switch (source) {
    case Source.content:
      return SOURCE_CONTENT;
    case Source.bcdApi:
      return SOURCE_BCD_API;
    case Source.client:
      return SOURCE_CLIENT;
    case Source.liveSamples:
      return SOURCE_LIVE_SAMPLES;
    case Source.rumba:
      return SOURCE_RUMBA;
    default:
      return "";
  }
}
