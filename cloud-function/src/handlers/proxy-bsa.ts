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

export async function proxyBSA(req: Request, res: Response): Promise<void> {
  const countryCode = getRequestCountry(req);

  const plusAvailable = countryCode in plusLookup.countryToCurrency;

  const userAgent = req.headers["user-agent"] ?? "";

  const parsedUrl = new URL(req.url, `${req.protocol}://${req.headers.host}/`);
  const pathname = parsedUrl.pathname ?? "";
  const search = parsedUrl.search ?? "";

  if (pathname === "/pong/get") {
    if (req.method !== "POST") {
      res.sendStatus(405).end();
      return;
    }

    const { body } = req;
    const { statusCode: status, payload } = await handleGet(
      body,
      countryCode,
      userAgent
    );

    payload.plusAvailable = plusAvailable;

    res
      .status(status)
      .setHeader("cache-control", "no-store")
      .setHeader("content-type", "application/json")
      .end(JSON.stringify(payload));
    return;
  } else if (req.path === "/pong/click") {
    if (req.method !== "GET") {
      res.sendStatus(405).end();
      return;
    }
    const params = new URLSearchParams(search);
    try {
      const { status, location } = await handleClick(
        params,
        countryCode,
        userAgent
      );
      if (location && (status === 301 || status === 302)) {
        res.redirect(location);
        return;
      } else {
        res.sendStatus(502).end();
        return;
      }
    } catch (e) {
      console.error(e);
    }
  } else if (pathname === "/pong/viewed") {
    if (req.method !== "POST") {
      res.sendStatus(405).end();
      return;
    }
    const params = new URLSearchParams(search);
    try {
      await handleViewed(params, countryCode, userAgent);
      res.sendStatus(201).end();
      return;
    } catch (e) {
      console.error(e);
    }
  } else if (pathname.startsWith("/pimg/")) {
    const src = coder.decodeAndVerify(
      decodeURIComponent(pathname.substring("/pimg/".length))
    );
    if (!src) {
      res.sendStatus(400).end();
      return;
    }
    const { buf, contentType } = await fetchImage(src);
    res
      .status(200)
      .set({
        "cache-control": "max-age=86400",
        "content-type": contentType,
      })
      .end(Buffer.from(buf));
    return;
  }

  res.status(204).end();
}
