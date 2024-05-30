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
      const res = await (
        await fetch(
          `https://srv.buysellads.com/ads/${zoneKey}.json?forwardedip=${encodeURIComponent(
            anonymousIp
          )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
        )
      ).json();
      const {
        ads: [
          {
            statlink = null,
            statimp,
            Description,
            Image,
            ImageTitle,
            BackgroundColor,
            BackgroundColorLight,
            BackgroundColorDark,
            CallToAction,
            CtaBackgroundColorLight,
            CtaBackgroundColorDark,
            CtaTextColorLight,
            CtaTextColorDark,
            TextColor,
            TextColorLight,
            TextColorDark,
          },
        ] = [],
      } = res;
      return {
        name,
        p:
          statlink === null
            ? null
            : {
                click: coder.encodeAndSign(statlink),
                view: coder.encodeAndSign(statimp),
                image: coder.encodeAndSign(Image),
                alt: ImageTitle && he.decode(ImageTitle),
                copy: Description && he.decode(Description),
                cta: CallToAction && he.decode(CallToAction),
                colors: {
                  textColor: TextColor || TextColorLight,
                  backgroundColor: BackgroundColor || BackgroundColorLight,
                  ctaTextColor: CtaTextColorLight,
                  ctaBackgroundColor: CtaBackgroundColorLight,
                  textColorDark: TextColorDark,
                  backgroundColorDark: BackgroundColorDark,
                  ctaTextColorDark: CtaTextColorDark,
                  ctaBackgroundColorDark: CtaBackgroundColorDark,
                },
              },
      };
    });
    const decisionRes = (await Promise.allSettled(requests))
      .filter((p) => {
        if (p.status === "rejected") {
          console.log(`rejected ad request: ${p.reason}`);
        }
        return p.status === "fulfilled";
      })
      .map((p) => p.value);

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
            return null;
          }
          const { copy, image, alt, click, view, cta, colors = {} } = v;
          return [
            p,
            {
              status: "success",
              copy,
              image,
              alt,
              cta,
              colors,
              click,
              view,
              version: 2,
            },
          ];
        })
        .filter(Boolean)
    );
    return { statusCode: 200, payload };
  };
}

export function createPong2ClickHandler(coder) {
  return async (params, countryCode, userAgent) => {
    const click = coder.decodeAndVerify(params.get("code"));

    if (!click) {
      return {};
    }

    const anonymousIp = anonymousIpByCC(countryCode);
    const clickURL = createURL(click);
    clickURL.searchParams.set("forwardedip", anonymousIp);
    clickURL.searchParams.set("useragent", userAgent);

    const res = await fetch(clickURL, {
      redirect: "manual",
    });
    const status = res.status;
    const location = res.headers.get("location");
    return { status, location };
  };
}

export function createPong2ViewedHandler(coder) {
  return async (params, countryCode, userAgent) => {
    const view = coder.decodeAndVerify(params.get("code"));
    if (view) {
      const anonymousIp = anonymousIpByCC(countryCode);
      const viewURL = createURL(view);
      viewURL.searchParams.set("forwardedip", anonymousIp);
      viewURL.searchParams.set("useragent", userAgent);

      await fetch(viewURL, {
        redirect: "manual",
      });
    }
  };
}

function createURL(payload) {
  if (payload.startsWith("//")) {
    // BSA omitted 'https:' until May 2024.
    return new URL(`https:${payload}`);
  }

  if (!payload.startsWith("https://")) {
    console.error(`Invalid URL payload: ${payload}`);
  }

  return new URL(payload);
}
