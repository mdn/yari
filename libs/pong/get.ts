import { Client } from "@adzerk/decision-sdk";
import he from "he";

import anonymousIpByCC from "./cc2ip.js";
import { fallbackHandler } from "./fallback.js";
import { Coder } from "./coding.js";

interface PongEnvs {
  KEVEL_SITE_ID: number;
  KEVEL_NETWORK_ID: number;
  CARBON_ZONE_KEY: string;
  SIGN_SECRET: string;
  FALLBACK_ENABLED: boolean;
}

type GetHandler = (
  body: string,
  countryCode: string,
  userAgent: string
) => Promise<{
  statusCode: number;
  payload: Payload;
}>;

type Payload = {
  status: Status;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  fallback?: Fallback;
  cta?: string;
  colors?: Colors;
};

type Status = "cap_reached" | "geo_unsupported";

type Fallback = {
  click: string;
  view: string;
  copy: string;
  image: string;
  by: string;
};

type Colors = {
  textColor?: string;
  backgroundColor?: string;
  ctaTextColor?: string;
  ctaBackgroundColor?: string;
};

const PLACEMENTS = {
  side: 369,
  top: 585,
};

// Allow list for client sent keywords.
const ALLOWED_KEYWORDS = [];

export function createPongGetHandler(
  client: Client,
  coder: Coder,
  env: PongEnvs
): GetHandler {
  const { CARBON_ZONE_KEY, FALLBACK_ENABLED } = env;
  return async (body, countryCode, userAgent) => {
    const { keywords = [], pongs = null } = body;
    const anonymousIp = anonymousIpByCC(countryCode);

    if (pongs === null) {
      const decisionReq = {
        placements: [{ adTypes: [465, 369] }],
        keywords: [
          ...keywords.filter((k) => ALLOWED_KEYWORDS.includes(k)),
          countryCode,
        ],
      };

      const decisionRes = (await client.decisions.get(decisionReq, {
        ip: anonymousIp,
      })) as any;
      const {
        decisions: { div0 } = {},
        candidateRetrieval: { div0: { candidatesFoundCount = null } = {} } = {},
      } = decisionRes;
      if (div0 === null || div0?.[0] === null) {
        let status = candidatesFoundCount ? "cap_reached" : "geo_unsupported";
        return { statusCode: 200, payload: { status } };
      }

      const [{ contents, clickUrl, impressionUrl }] = div0;
      if (
        FALLBACK_ENABLED &&
        CARBON_ZONE_KEY &&
        CARBON_ZONE_KEY !== "undefined" &&
        contents?.[0]?.data?.customData?.fallback
      ) {
        // fall back to carbon
        const fallback = await fallbackHandler(
          coder,
          CARBON_ZONE_KEY,
          userAgent,
          anonymousIp
        );
        if (fallback !== null) {
          const payload = {
            status: "success",
            click: coder.encodeAndSign(clickUrl),
            view: coder.encodeAndSign(impressionUrl),
            fallback,
          };
          return { statusCode: 200, payload };
        }
      } else {
        const payload = {
          status: "success",
          copy: he.decode(
            contents?.[0]?.data?.title || "This is an ad without copy?!"
          ),
          image: coder.encodeAndSign(contents[0]?.data?.imageUrl),
          click: coder.encodeAndSign(clickUrl),
          view: coder.encodeAndSign(impressionUrl),
        };
        return { statusCode: 200, payload };
      }
    } else {
      const placements = pongs.map((p) => {
        return { divName: p, adTypes: [PLACEMENTS[p]] };
      });
      const decisionReq = {
        placements,
        keywords: [
          ...keywords.filter((k) => ALLOWED_KEYWORDS.includes(k)),
          countryCode,
        ],
      };
      const decisionRes = await client.decisions.get(decisionReq, {
        ip: anonymousIp,
      });

      const { decisions = {} } = decisionRes;

      if (
        pongs.every((p) => decisions[p] === null || decisions[p]?.[0] === null)
      ) {
        let status = "geo_unsupported";
        return { statusCode: 200, payload: { status } };
      }
      const payload = Object.fromEntries(
        Object.entries(decisions)
          .map(([p, v]) => {
            if (v === null || v?.[0] === null) {
              return [p, null];
            }
            if (p === "side") {
              const [{ contents, clickUrl, impressionUrl }] = v;
              return [
                p,
                {
                  status: "success",
                  copy: he.decode(
                    contents?.[0]?.data?.title || "This is an ad without copy?!"
                  ),
                  image: coder.encodeAndSign(contents[0]?.data?.imageUrl),
                  click: coder.encodeAndSign(clickUrl),
                  view: coder.encodeAndSign(impressionUrl),
                },
              ];
            } else if (p === "top") {
              const [{ contents, clickUrl, impressionUrl }] = v;
              const { colors, cta } = contents?.[0]?.data?.customData || {};
              return [
                p,
                {
                  status: "success",
                  copy: he.decode(contents?.[0]?.data?.title || ""),
                  cta: he.decode(cta || "No CTA"),
                  image: coder.encodeAndSign(contents[0]?.data?.imageUrl),
                  colors,
                  click: coder.encodeAndSign(clickUrl),
                  view: coder.encodeAndSign(impressionUrl),
                },
              ];
            }
          })
          .filter(Boolean)
      );
      return { statusCode: 200, payload };
    }
    return { statusCode: 204, payload: null };
  };
}
