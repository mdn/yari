import he from "he";
import anonymousIpByCC from "./cc2ip.js";

const PLACEMENTS = {
  side: 369,
  top: 585,
  hpMain: 3214,
  hpFooter: 2327,
};

// Allow list for client sent keywords.
const ALLOWED_KEYWORDS = [];

export function createPongGetHandler(client, coder) {
  return async (body, countryCode) => {
    const { keywords = [], pongs = null } = body;
    const anonymousIp = anonymousIpByCC(countryCode);

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
          if ((p === "side") | (p === "hpMain") | (p === "hpFooter")) {
            const [{ contents, clickUrl, impressionUrl }] = v;
            const { colors } = contents?.[0]?.data?.customData || {};
            return [
              p,
              {
                status: "success",
                copy: he.decode(
                  contents?.[0]?.data?.title || "This is an ad without copy?!"
                ),
                image: coder.encodeAndSign(contents[0]?.data?.imageUrl),
                colors,
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
  };
}
