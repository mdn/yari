import type { Request, Response } from "express";

import { Coder } from "../internal/pong/index.js";
import {
  createPong2GetHandler,
  createPong2ClickHandler,
  createPong2ViewedHandler,
  fetchImage,
} from "../internal/pong/index.js";

import * as env from "../env.js";

import { getRequestCountry } from "../utils.js";

const { SIGN_SECRET, BSA_ZONE_KEYS } = env;

const coder = new Coder(SIGN_SECRET);
const handleGet = createPong2GetHandler(BSA_ZONE_KEYS, coder, env);
const handleClick = createPong2ClickHandler(coder);
const handleViewed = createPong2ViewedHandler(coder);

export async function proxyBSA(req: Request, res: Response) {
  const countryCode = getRequestCountry(req);

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
      const { status, location } = await handleClick(
        params,
        countryCode,
        userAgent
      );
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
      await handleViewed(params, countryCode, userAgent);
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
