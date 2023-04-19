import he from "he";
import anonymousIpByCC from "./cc2ip.js";
import { fallbackHandler } from "./fallback.js";

const PLACEMENTS = {
  banner: 369,
  topBanner: 585,
};

// Allow list for client sent keywords.
const ALLOWED_KEYWORDS = [];

export function createPongGetHandler(client, coder, env) {
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

      const decisionRes = await client.decisions.get(decisionReq, {
        ip: anonymousIp,
      });
      const {
        decisions: { div0 } = {},
        candidateRetrieval: { div0: { candidatesFoundCount } = {} } = {},
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
            if (p === "banner") {
              const [{ contents, clickUrl, impressionUrl }] = v;
              return [
                p,
                {
                  status: "success",
                  copy: he.decode(
                    contents?.[0]?.data?.title ||
                      contents?.[0]?.data?.cttitle ||
                      "This is an ad without copy?!"
                  ),
                  image: coder.encodeAndSign(contents[0]?.data?.imageUrl),
                  click: coder.encodeAndSign(clickUrl),
                  view: coder.encodeAndSign(impressionUrl),
                },
              ];
            } else if (p === "topBanner") {
              const [{ contents, clickUrl, impressionUrl }] = v;
              const {
                ctImage,
                ctCopy,
                ctCtaCopy,
                ctColor,
                ctBackground,
                ctCtaColor,
                ctCtaBackground,
              } = contents?.[0]?.data || {};
              const colors =
                ctColor || ctBackground || ctCtaColor || ctCtaBackground
                  ? {
                      color: ctColor,
                      background: ctBackground,
                      ctaColor: ctCtaColor,
                      ctaBackground: ctCtaBackground,
                    }
                  : undefined;
              return [
                p,
                {
                  status: "success",
                  copy: he.decode(
                    contents?.[0]?.data?.title ||
                      ctCopy ||
                      "This is an ad without copy?!"
                  ),
                  cta: he.decode(ctCtaCopy || "No CTA"),
                  image: coder.encodeAndSign(
                    contents[0]?.data?.imageUrl ||
                      (ctImage && `https://s.zkcdn.net/Advertisers/${ctImage}`)
                  ),
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
