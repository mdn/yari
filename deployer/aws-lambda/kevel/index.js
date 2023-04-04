import { Client } from "@adzerk/decision-sdk";

import { Coder } from "@yari-internal/pong";
import {
  makePongGetHandler,
  makePongClickHandler,
  makePongViewedHandler,
  fetchImage,
} from "@yari-internal/pong";

// eslint-disable-next-line n/no-missing-import
import * as env from "./env.js";
import cc2ip from "./cc2ip.js";

const STATUS_DESCRIPTION = {
  200: "OK",
  204: "NO_CONTENT",
  404: "NOT_FOUND",
  405: "METHOD_NOT_ALLOWED",
};

const { KEVEL_SITE_ID, KEVEL_NETWORK_ID, SIGN_SECRET } = env;

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

const CODER = new Coder(SIGN_SECRET);
const pongGetHandler = makePongGetHandler(client, CODER, env);
const pongClickHandler = makePongClickHandler(CODER);
const pongViewedHandler = makePongViewedHandler(CODER);

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
        statusDescription: STATUS_DESCRIPTION[405],
      };
    }
    const body = JSON.parse(
      Buffer.from(request.body.data, "base64").toString()
    );
    const { statusCode: status, payload } = await pongGetHandler(
      body,
      countryCode,
      anonymousIp,
      userAgent
    );
    const response = {
      status,
      statusDescription: STATUS_DESCRIPTION[status],
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
      const { status, location } = await pongClickHandler(params);
      if (status === 301 || status === 302) {
        return {
          status: 302,
          statusDescription: "FOUND",
          headers: {
            location: [
              {
                key: "Location",
                value: location,
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
      await pongViewedHandler(params);
      return {
        status: 201,
        statusDescription: "CREATED",
      };
    } catch (e) {
      console.error(e);
    }
  } else if (request.uri.startsWith("/pimg/")) {
    const src = CODER.decodeAndVerify(
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
