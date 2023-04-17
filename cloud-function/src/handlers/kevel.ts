import * as url from "node:url";

import type express from "express";
import { Client } from "@adzerk/decision-sdk";

import { Coder } from "../internal/pong/index.js";
import {
  createPongGetHandler,
  createPongClickHandler,
  createPongViewedHandler,
  fetchImage,
} from "../internal/pong/index.js";

import * as env from "../env.js";

import { getRequestCountry } from "../utils.js";

const { KEVEL_SITE_ID, KEVEL_NETWORK_ID, SIGN_SECRET } = env;

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

const coder = new Coder(SIGN_SECRET);
const handleGet = createPongGetHandler(client, coder, env);
const handleClick = createPongClickHandler(coder);
const handleViewed = createPongViewedHandler(coder);

export async function proxyKevel(req: express.Request, res: express.Response) {
  const countryCode = getRequestCountry(req);

  const userAgent = req.headers["user-agent"] ?? "";

  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname ?? "";
  const search = parsedUrl.search ?? "";

  if (pathname === "/pong/get") {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    const { body } = req;
    const { statusCode: status, payload } = await handleGet(
      body,
      countryCode,
      userAgent
    );

    return res
      .status(status)
      .setHeader("cache-control", "no-store")
      .setHeader("content-type", "application/json")
      .end(JSON.stringify(payload));
  } else if (req.path === "/pong/click") {
    if (req.method !== "GET") {
      return res.status(405).end();
    }
    const params = new URLSearchParams(search);
    try {
      const { status, location } = await handleClick(params);
      if (location && (status === 301 || status === 302)) {
        return res.redirect(location);
      } else {
        return res.status(502).end();
      }
    } catch (e) {
      console.error(e);
    }
  } else if (pathname === "/pong/viewed") {
    if (req.method !== "POST") {
      return res.status(405).end();
    }
    const params = new URLSearchParams(search);
    try {
      await handleViewed(params);
      return res.status(201).end();
    } catch (e) {
      console.error(e);
    }
  } else if (pathname.startsWith("/pimg/")) {
    const src = coder.decodeAndVerify(
      decodeURIComponent(pathname.substring("/pimg/".length))
    );
    if (!src) {
      return res.status(400).end();
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
