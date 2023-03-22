/* global fetch */
import { createHmac } from "node:crypto";
import * as url from "node:url";

import type express from "express";
import { Client } from "@adzerk/decision-sdk";
import {
  KEVEL_SITE_ID,
  KEVEL_NETWORK_ID,
  SIGN_SECRET,
  CARBON_ZONE_KEY,
  CARBON_FALLBACK_ENABLED,
} from "../env.js";
import { CC_TO_IP } from "../constants.js";
import { getRequestCountry } from "../utils.js";

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

export async function fetchImage(src: string) {
  const imageResponse = await fetch(src);
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type");
  return { buf: imageBuffer, contentType };
}

function encodeAndSign(s: string): string {
  const hmac = createHmac("sha256", SIGN_SECRET);
  hmac.update(s);
  return `${Buffer.from(s, "utf-8").toString("base64")}.${hmac.digest(
    "base64"
  )}`;
}

function decodeAndVerify(tuple: string): string | null {
  if (tuple === null) {
    return null;
  }
  const [encoded, digest] = tuple.split(".");
  if (!encoded || !digest) {
    return null;
  }
  const s = Buffer.from(encoded, "base64").toString("utf-8");
  const hmac = createHmac("sha256", SIGN_SECRET);
  hmac.update(s);
  if (hmac.digest("base64") == digest) {
    // === won't work...
    return s;
  }
  return null;
}

export async function proxyKevel(req: express.Request, res: express.Response) {
  const countryCode = getRequestCountry(req);
  const anonymousIp = CC_TO_IP[countryCode] ?? "127.0.0.1";

  const userAgent = req.headers["user-agent"] ?? null;

  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname ?? "";
  const search = parsedUrl.search ?? "";

  if (pathname === "/pong/get") {
    if (req.method !== "POST") {
      return res.status(405).end();
    }

    const { keywords = [] } = req.body;
    const decisionReq = {
      placements: [{ adTypes: [465, 369] }],
      keywords: [...keywords, countryCode],
    };

    const decisionRes = await client.decisions.get(decisionReq, {
      ip: anonymousIp,
    } as any);
    const { decisions: { div0 } = {} } = decisionRes;
    if (div0 === null || div0?.[0] === null) {
      return res.status(204).end();
    }

    let payload = {};

    const [{ contents, clickUrl, impressionUrl }] = div0 as any;
    if (
      CARBON_FALLBACK_ENABLED &&
      CARBON_ZONE_KEY &&
      CARBON_ZONE_KEY !== "undefined" &&
      contents?.[0]?.data?.customData?.fallback
    ) {
      // fall back to carbon
      try {
        const {
          ads: [
            { description = null, statlink, statimp, smallImage, ad_via_link },
          ] = [],
        } = await (
          await fetch(
            `https://srv.buysellads.com/ads/${CARBON_ZONE_KEY}.json?forwardedip=${encodeURIComponent(
              anonymousIp
            )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
          )
        ).json();
        payload = {
          click: encodeAndSign(clickUrl),
          view: encodeAndSign(impressionUrl),
          fallback: {
            click: encodeAndSign(statlink),
            view: encodeAndSign(statimp),
            image: encodeAndSign(smallImage),
            copy: description,
            by: ad_via_link,
          },
        };
      } catch (e) {
        console.log(e);
        return res.status(400).end();
      }
    } else {
      payload = {
        copy: contents?.[0]?.data?.title || "This is an ad without copy?!",
        image: encodeAndSign(contents[0]?.data?.imageUrl),
        click: encodeAndSign(clickUrl),
        view: encodeAndSign(impressionUrl),
      };
    }

    return res
      .status(200)
      .setHeader("cache-control", "no-store")
      .setHeader("content-type", "application/json")
      .end(JSON.stringify(payload));
  } else if (req.path === "/pong/click") {
    if (req.method !== "GET") {
      return res.status(405).end();
    }
    const params = new URLSearchParams(search);
    try {
      const click = decodeAndVerify(params.get("code") ?? "");
      const fallback = decodeAndVerify(params.get("fallback") ?? "");

      if (!click) {
        return res.status(400).end();
      }

      const fetchRes = await fetch(click, { redirect: "manual" });
      let status = fetchRes.status;
      let headers = fetchRes.headers;
      if (fallback) {
        const fallbackRes = await fetch(`https:${fallback}`, {
          redirect: "manual",
        });
        status = fallbackRes.status;
        headers = fallbackRes.headers;
      }
      const location = headers.get("location");
      if (location && (status === 301 || status === 302)) {
        return res.redirect(location);
      } else {
        return res.status(502).end();
      }
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  } else if (pathname === "/pong/viewed") {
    if (req.method !== "POST") {
      return {
        status: 405,
        statusDescription: "METHOD_NOT_ALLOWED",
      };
    }
    const params = new URLSearchParams(search);
    try {
      const view = decodeAndVerify(params.get("code") ?? "");
      const fallback = decodeAndVerify(params.get("fallback") ?? "");
      fallback && (await fetch(`https:${fallback}`, { redirect: "manual" }));

      if (!view) {
        return res.status(400).end();
      }

      await fetch(view, { redirect: "manual" });
      return res.status(201).end();
    } catch (e) {
      console.error(e);
      return res.status(500).end();
    }
  } else if (pathname.startsWith("/pimg/")) {
    const src = decodeAndVerify(
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
