import * as path from "node:path";
import { cwd } from "node:process";

import dotenv from "dotenv";
import { Request } from "express";

dotenv.config({
  path: path.join(cwd(), process.env["ENV_FILE"] || ".env"),
});

export const LOCAL_CONTENT = "http://localhost:8100/";
export const LOCAL_RUMBA = "http://localhost:8000/";

export enum Origin {
  main = "main",
  liveSamples = "liveSamples",
  review = "review",
  play = "play",
  unsafe = "unsafe",
}

export enum Source {
  content = "content",
  liveSamples = "liveSamples",
  review = "review",
  api = "rumba",
  sharedAssets = "sharedAssets",
}

export const ORIGIN_MAIN: string = process.env["ORIGIN_MAIN"] || "localhost";
export const ORIGIN_LIVE_SAMPLES: string =
  process.env["ORIGIN_LIVE_SAMPLES"] || "localhost";
export const ORIGIN_PLAY: string = process.env["ORIGIN_PLAY"] || "localhost";
export const ORIGIN_REVIEW: string = process.env["ORIGIN_REVIEW"] || "";
export const ORIGIN_REVIEW_REGEXP: RegExp | null = ORIGIN_REVIEW
  ? new RegExp(ORIGIN_REVIEW.replaceAll(".", "[.]").replace("*", "(.+)"))
  : null;
export const ORIGIN_REVIEW_MATCHER: (origin: string) => string | null = (
  origin
) => {
  if (!ORIGIN_REVIEW_REGEXP) {
    return null;
  }

  const match = origin.match(ORIGIN_REVIEW_REGEXP);

  if (!match) {
    return null;
  }

  return match[1] ?? null;
};

export const SOURCE_CONTENT: string =
  process.env["SOURCE_CONTENT"] || LOCAL_CONTENT;
export const SOURCE_API: string =
  process.env["SOURCE_API"] || "https://developer.allizom.org/";
export const SOURCE_REVIEW: string =
  process.env["SOURCE_REVIEW"] || LOCAL_CONTENT;
export const SOURCE_SHARED_ASSETS: string =
  process.env["SOURCE_SHARED_ASSETS"] || "https://mdn.github.io/shared-assets/";

export function getOriginFromRequest(req: Request): Origin {
  if (
    req.hostname === ORIGIN_MAIN &&
    !req.path.includes("/_sample_.") &&
    !req.path.endsWith("/runner.html")
  ) {
    return Origin.main;
  } else if (ORIGIN_REVIEW_MATCHER(req.hostname)) {
    return Origin.review;
  } else if (
    req.hostname === ORIGIN_LIVE_SAMPLES &&
    !req.path.endsWith("/runner.html")
  ) {
    return Origin.liveSamples;
  } else if (req.hostname.endsWith(ORIGIN_PLAY)) {
    return Origin.play;
  } else {
    return Origin.unsafe;
  }
}

export function sourceUri(source: Source): string {
  switch (source) {
    case Source.content:
      return SOURCE_CONTENT;
    case Source.review:
      return SOURCE_REVIEW;
    case Source.api:
      return SOURCE_API;
    case Source.sharedAssets:
      return SOURCE_SHARED_ASSETS;
    default:
      return "";
  }
}

// Origin trial.
export const ORIGIN_TRIAL_TOKEN: string | undefined =
  process.env["ORIGIN_TRIAL_TOKEN"];

// Kevel.
export const KEVEL_SITE_ID = Number(process.env["KEVEL_SITE_ID"] ?? 0);
export const KEVEL_NETWORK_ID = Number(process.env["KEVEL_NETWORK_ID"] ?? 0);
export const SIGN_SECRET = process.env["SIGN_SECRET"] ?? "";
export const BSA_ZONE_KEYS = Object.fromEntries(
  (process.env["BSA_ZONE_KEYS"] ?? "").split(";").map((k) => k.split(":"))
);
export const BSA_ENABLED = Boolean(
  JSON.parse(process.env["BSA_ENABLED"] || "false")
);

// HTTPS.
// (Use https://github.com/FiloSottile/mkcert to generate a locally-trusted certificate.)
export const HTTPS_KEY_FILE = process.env["HTTPS_KEY_FILE"] ?? "";
export const HTTPS_CERT_FILE = process.env["HTTPS_CERT_FILE"] ?? "";

export function determineInfix(host: any): string {
  if (typeof host === "string") {
    const reviewPrefix = ORIGIN_REVIEW_MATCHER(host);
    if (reviewPrefix) {
      return `${reviewPrefix}`;
    }
  }
  return "";
}
