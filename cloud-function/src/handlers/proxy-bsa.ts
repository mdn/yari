import type { Request, Response } from "express";

import { Coder } from "../internal/pong/index.js";
import {
  createPong2GetHandler,
  createPong2ClickHandler,
  createPong2ViewedHandler,
  fetchImage,
} from "../internal/pong/index.js";

import stagePlusLookup from "../stripe-plans/stage.js";
import prodPlusLookup from "../stripe-plans/prod.js";
import * as env from "../env.js";

import { getRequestCountry } from "../utils.js";

const { SIGN_SECRET, BSA_ZONE_KEYS, ORIGIN_MAIN } = env;

const coder = new Coder(SIGN_SECRET);
const handleGet = createPong2GetHandler(BSA_ZONE_KEYS, coder, env);
const handleClick = createPong2ClickHandler(coder);
const handleViewed = createPong2ViewedHandler(coder);
const plusLookup =
  ORIGIN_MAIN === "developer.mozilla.org" ? prodPlusLookup : stagePlusLookup;

export async function proxyBSA(req: Request, res: Response) {
  const countryCode = getRequestCountry(req);

  const plusAvailable = countryCode in plusLookup.countryToCurrency;

  const userAgent = req.headers["user-agent"] ?? "";

  const parsedUrl = new URL(req.url, `${req.protocol}://${req.headers.host}/`);
  const pathname = parsedUrl.pathname ?? "";
  const search = parsedUrl.search ?? "";

  if (pathname === "/pong/get") {
    if (req.method !== "POST") {
      return res.sendStatus(405).end();
    }

    const { body } = req;
    const { statusCode: status, payload } = await handleGet(
      body,
      countryCode,
      userAgent
    );

    payload.plusAvailable = plusAvailable;

    return res
      .status(status)
      .setHeader("cache-control", "no-store")
      .setHeader("content-type", "application/json")
      .end(JSON.stringify(payload));
  } else if (req.path === "/pong/click") {
    if (req.method !== "GET") {
      return res.sendStatus(405).end();
    }

    const referer = req.get("referer");
    if (!referer) {
      console.warn("[pong/click] Missing Referer (expected MDN host)");
      return res.sendStatus(400).end();
    }

    const refererUrl = new URL(referer);
    if (refererUrl.host != parsedUrl.host) {
      console.warn(
        `[pong/click] Disallowed Referer (expected MDN host, was ${JSON.stringify(referer)})`
      );
      return res.sendStatus(400).end();
    }

    const params = new URLSearchParams(search);
    try {
      const { status, location } = await handleClick(
        params,
        countryCode,
        userAgent
      );
      if (location && (status === 301 || status === 302)) {
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("X-Robots-Tag", "noindex, nofollow");
        return res.redirect(location);
      } else {
        return res.sendStatus(status ?? 502).end();
      }
    } catch (e) {
      console.error(e);
    }
  } else if (pathname === "/pong/viewed") {
    if (req.method !== "POST") {
      return res.sendStatus(405).end();
    }
    const params = new URLSearchParams(search);
    try {
      await handleViewed(params, countryCode, userAgent);
      return res.sendStatus(201).end();
    } catch (e) {
      console.error(e);
    }
  } else if (pathname.startsWith("/pimg/")) {
    if (req.method !== "GET") {
      return res.sendStatus(405).end();
    }

    const src = coder.decodeAndVerify(
      decodeURIComponent(pathname.substring("/pimg/".length))
    );

    if (!src) {
      console.warn("[pimg] Invalid src");
      return res.sendStatus(400).end();
    }

    const { status, buf, contentType } = await fetchImage(src);

    if (status >= 400) {
      console.warn(`[pimg] Image fetch failed: HTTP ${status}`);
      return res
        .status(status)
        .set({
          "cache-control": "no-store",
          "content-type": contentType,
        })
        .end(Buffer.from(buf));
    }

    return res
      .status(200)
      .set({
        "cache-control": "max-age=86400",
        "content-type": contentType,
        "x-robots-tag": "noindex, nofollow",
      })
      .end(Buffer.from(buf));
  }

  return res.status(204).end();
}
