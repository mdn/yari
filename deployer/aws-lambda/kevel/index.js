import { Client } from "@adzerk/decision-sdk";
import { KEVEL_SITE_ID, KEVEL_NETWORK_ID } from "./env.js";

const siteId = KEVEL_SITE_ID;
const networkId = KEVEL_NETWORK_ID;
const client = new Client({ networkId, siteId });

export async function handler(event) {
  const request = event.Records[0].cf.request;
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-cloudfront-headers.html
  // const countryHeader = request.headers["cloudfront-viewer-country"];

  let payload = {};

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
      placements: [{ adTypes: [465] }],
      keywords,
    };

    const decisionRes = await client.decisions.get(decisionReq);
    const {
      decisions: { div0: [{ contents, clickUrl, impressionUrl }] = {} } = {},
    } = decisionRes;
    payload = {
      contents,
      click: Buffer.from(clickUrl, "utf-8").toString("base64"),
      impression: Buffer.from(impressionUrl).toString("base64"),
    };
    payload = {
      contents,
      click: Buffer.from(clickUrl).toString("base64"),
      impression: Buffer.from(impressionUrl).toString("base64"),
    };
    const response = {
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
    const click = Buffer.from(params.get("code"), "base64").toString("utf-8");
    const { headers, status } = await fetch(click, { redirect: "manual" }); // eslint-disable-line no-undef
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
  } else if (request.uri === "/pong/viewed") {
    if (request.method !== "POST") {
      return {
        status: 405,
        statusDescription: "METHOD_NOT_ALLOWED",
      };
    }
    const params = new URLSearchParams(request.querystring);
    const click = Buffer.from(params.get("code"), "base64").toString("utf-8");
    await fetch(click, { redirect: "manual" }); // eslint-disable-line no-undef
    return {
      status: 200,
      statusDescription: "OK",
    };
  }
  return {
    status: 404,
    statusDescription: "NOT_FOUND",
  };
}
