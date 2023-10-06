/* global fetch */
import he from "he";
import anonymousIpByCC from "./cc2ip.js";

export function createPong2GetHandler(zoneKeys, coder) {
  return async (body, countryCode, userAgent) => {
    const { pongs = null } = body;
    const anonymousIp = anonymousIpByCC(countryCode);

    const placements = pongs
      .filter((p) => p in zoneKeys)
      .map((p) => {
        return { name: p, zoneKey: [zoneKeys[p]] };
      });

    const requests = placements.map(async ({ name, zoneKey }) => {
      const {
        ads: [
          {
            description = null,
            statlink,
            statimp,
            smallImage,
            backgroundColor,
            backgroundHoverColor,
            callToAction,
            ctaBackgroundColor,
            ctaBackgroundHoverColor,
            ctaTextColor,
            ctaTextColorHover,
            textColor,
            textColorHover,
          },
        ] = [],
      } = await (
        await fetch(
          `https://srv.buysellads.com/ads/${zoneKey}.json?forwardedip=${encodeURIComponent(
            anonymousIp
          )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
        )
      ).json();
      return {
        name,
        p:
          description === null
            ? null
            : {
                click: coder.encodeAndSign(statlink),
                view: coder.encodeAndSign(statimp),
                image: coder.encodeAndSign(smallImage),
                copy: description,
                cta: callToAction && he.decode(callToAction),
                colors: {
                  textColor,
                  backgroundColor,
                  ctaTextColor,
                  ctaBackgroundColor,
                  textColorDark: textColorHover,
                  backgroundColorDark: backgroundHoverColor,
                  ctaTextColorDark: ctaTextColorHover,
                  ctaBackgroundColorDark: ctaBackgroundHoverColor,
                },
              },
      };
    });
    const decisionRes = await Promise.all(requests);

    const decisions = Object.fromEntries(
      decisionRes.map(({ name, p }) => [name, p])
    );

    if (pongs.every((p) => decisions[p] === null)) {
      let status = "geo_unsupported";
      return { statusCode: 200, payload: { status } };
    }
    const payload = Object.fromEntries(
      Object.entries(decisions)
        .map(([p, v]) => {
          if (v === null) {
            return [p, null];
          }
          const { copy, image, click, view, cta, colors = {} } = v;
          return [
            p,
            {
              status: "success",
              copy,
              image,
              cta,
              colors,
              click,
              view,
            },
          ];
        })
        .filter(Boolean)
    );
    return { statusCode: 200, payload };
  };
}

export function createPong2ClickHandler(coder) {
  return async (params) => {
    const click = coder.decodeAndVerify(params.get("code"));
    const res = await fetch(`https:${click}`, { redirect: "follow" });
    const status = res.status;
    const location = res.headers.get("location");
    return { status, location };
  };
}

export function createPong2ViewedHandler(coder) {
  return async (params) => {
    const view = coder.decodeAndVerify(params.get("code"));
    await fetch(`https:${view}`, {
      redirect: "manual",
    });
  };
}
