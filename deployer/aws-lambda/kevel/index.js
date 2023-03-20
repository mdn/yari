/* global fetch */
import { createHmac } from "node:crypto";

import { Client } from "@adzerk/decision-sdk";
import he from "he";
import {
  KEVEL_SITE_ID,
  KEVEL_NETWORK_ID,
  SIGN_SECRET,
  CARBON_ZONE_KEY,
  FALLBACK_ENABLED,
  // eslint-disable-next-line n/no-missing-import
} from "./env.js";
import cc2ip from "./cc2ip.js";

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

export async function fetchImage(src) {
  const imageResponse = await fetch(src);
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type");
  return { buf: imageBuffer, contentType };
}

function encodeAndSign(s = "") {
  const hmac = createHmac("sha256", SIGN_SECRET);
  hmac.update(s);
  return `${Buffer.from(s, "utf-8").toString("base64")}.${hmac.digest(
    "base64"
  )}`;
}

function decodeAndVerify(tuple = "") {
  if (tuple === null) {
    return null;
  }
  const [encoded, digest] = tuple.split(".");
  const s = Buffer.from(encoded, "base64").toString("utf-8");
  const hmac = createHmac("sha256", SIGN_SECRET);
  hmac.update(s);
  if (hmac.digest("base64") == digest) {
    // === won't work...
    return s;
  }
  return null;
}

export async function handler(event) {
  const request = event.Records[0].cf.request;
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-cloudfront-headers.html
  const countryHeader = request.headers["cloudfront-viewer-country"];
  const countryCode = countryHeader ? countryHeader[0].value : "US";
  const anonymousIp = cc2ip[countryCode] ?? "127.0.0.1";

  const userAgentHeader = request.headers["user-agent"];
  const userAgent = userAgentHeader ? userAgentHeader[0].value : null;

  if (request.uri === "/pong/get") {
    if (request.method !== "POST") {
      return {
        status: 405,
        statusDescription: "METHOD_NOT_ALLOWED",
      };
    }
    const { keywords = [] } = JSON.parse(
      Buffer.from(request.body.data, "base64").toString()
    );
    const decisionReq = {
      placements: [{ adTypes: [465, 369] }],
      keywords: [...keywords, countryCode],
    };

    const decisionRes = await client.decisions.get(decisionReq, {
      ip: anonymousIp,
    });
    const { decisions: { div0 } = {} } = decisionRes;
    if (div0 === null || div0?.[0] === null) {
      return {
        status: 204,
        statusDescription: "NO_CONTENT",
      };
    }

    let payload = {};

    const [{ contents, clickUrl, impressionUrl }] = div0;
    if (
      FALLBACK_ENABLED &&
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
        return {
          status: 400,
          statusDescription: "BAD_REQUEST",
        };
      }
    } else {
      payload = {
        copy: he.decode(
          contents?.[0]?.data?.title || "This is an ad without copy?!"
        ),
        image: encodeAndSign(contents[0]?.data?.imageUrl),
        click: encodeAndSign(clickUrl),
        view: encodeAndSign(impressionUrl),
      };
    }
    const response = {
      status: 200,
      statusDescription: "OK",
      headers: {
        "cache-control": [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
        "content-type": [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
      body: JSON.stringify(payload),
    };

    return response;
  } else if (request.uri === "/pong/click") {
    if (request.method !== "GET") {
      return {
        status: 405,
        statusDescription: "METHOD_NOT_ALLOWED",
      };
    }
    const params = new URLSearchParams(request.querystring);
    try {
      const click = decodeAndVerify(params.get("code"));
      const fallback = decodeAndVerify(params.get("fallback"));
      const res = await fetch(click, { redirect: "manual" });
      let status = res.status;
      let headers = res.headers;
      if (fallback) {
        const fallbackRes = await fetch(`https:${fallback}`, {
          redirect: "manual",
        });
        status = fallbackRes.status;
        headers = fallbackRes.headers;
      }
      if (status === 301 || status === 302) {
        return {
          status: 302,
          statusDescription: "FOUND",
          headers: {
            location: [
              {
                key: "Location",
                value: headers.get("location"),
              },
            ],
          },
        };
      }
    } catch (e) {
      console.error(e);
    }
  } else if (request.uri === "/pong/viewed") {
    if (request.method !== "POST") {
      return {
        status: 405,
        statusDescription: "METHOD_NOT_ALLOWED",
      };
    }
    const params = new URLSearchParams(request.querystring);
    try {
      const view = decodeAndVerify(params.get("code"));
      const fallback = decodeAndVerify(params.get("fallback"));
      fallback && (await fetch(`https:${fallback}`, { redirect: "manual" }));
      await fetch(view, { redirect: "manual" });
      return {
        status: 201,
        statusDescription: "CREATED",
      };
    } catch (e) {
      console.error(e);
    }
  } else if (request.uri.startsWith("/pimg/")) {
    const src = decodeAndVerify(
      decodeURIComponent(request.uri.substring("/pimg/".length))
    );
    const { buf, contentType } = await fetchImage(src);
    return {
      status: 200,
      statusDescription: "OK",
      headers: {
        "cache-control": [
          {
            key: "Cache-Control",
            value: "max-age=86400",
          },
        ],
        "content-type": [
          {
            key: "Content-Type",
            value: contentType,
          },
        ],
      },
      body: Buffer.from(buf).toString("base64"),
      bodyEncoding: "base64",
    };
  }
  return {
    status: 204,
    statusDescription: "NO_CONTENT",
  };
}
