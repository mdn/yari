import { Client } from "@adzerk/decision-sdk";
import type { Request, Response } from "express";

import { Coder } from "../internal/pong/index.js";
import {
  createPongGetHandler,
  createPongClickHandler,
  createPongViewedHandler,
  fetchImage,
} from "../internal/pong/index.js";

import stageLookup from "../stripe-plans/stage.js";
import prodLookup from "../stripe-plans/prod.js";
import * as env from "../env.js";

import { getRequestCountry } from "../utils.js";
import { ORIGIN_MAIN } from "../env.js";

const { KEVEL_SITE_ID, KEVEL_NETWORK_ID, SIGN_SECRET } = env;

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

const coder = new Coder(SIGN_SECRET);
const handleGet = createPongGetHandler(client, coder, env);
const handleClick = createPongClickHandler(coder);
const handleViewed = createPongViewedHandler(coder);
const lookupData =
  ORIGIN_MAIN === "developer.mozilla.org" ? prodLookup : stageLookup;

export async function proxyKevel(req: Request, res: Response) {
  const countryCode = getRequestCountry(req);

  const plusAvailable = Boolean(lookupData.countryToCurrency[countryCode]);

  const userAgent = req.headers["user-agent"] ?? "";

  const parsedUrl = new URL(req.url, `${req.protocol}://${req.headers.host}`);
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

    payload.plusAvailabe = plusAvailable;

    return res
      .status(status)
      .setHeader("cache-control", "no-store")
      .setHeader("content-type", "application/json")
      .end(JSON.stringify(payload));
  } else if (req.path === "/pong/click") {
    if (req.method !== "GET") {
      return res.sendStatus(405).end();
    }
    const params = new URLSearchParams(search);
    try {
      const { status, location } = await handleClick(params);
      if (location && (status === 301 || status === 302)) {
        return res.redirect(location);
      } else {
        return res.sendStatus(502).end();
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
      await handleViewed(params);
      return res.sendStatus(201).end();
    } catch (e) {
      console.error(e);
    }
  } else if (pathname.startsWith("/pimg/")) {
    const src = coder.decodeAndVerify(
      decodeURIComponent(pathname.substring("/pimg/".length))
    );
    if (!src) {
      return res.sendStatus(400).end();
    }
    const { buf, contentType } = await fetchImage(src);
    return res
      .status(200)
      .set({
        "cache-control": "max-age=86400",
        "content-type": contentType,
      })
      .end(Buffer.from(buf));
  }

  return res.status(204).end();
}
