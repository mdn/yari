import he from "he";
import anonymousIpByCC from "./cc2ip.js";

function fixupColor(hash) {
  if (typeof hash !== "string" && typeof hash !== "number") {
    return undefined;
  } else if (hash?.startsWith?.("rgb") || hash?.startsWith?.("#")) {
    return hash;
  } else {
    return `#${hash}`;
  }
}

export function createPong2GetHandler(zoneKeys, coder) {
  return async (body, countryCode, userAgent) => {
    let { pongs = null } = body;

    // Validate.
    if (!Array.isArray(pongs)) {
      return { statusCode: 400, payload: { status: "invalid" } };
    }

    // Sanitize.
    pongs = pongs.filter((p) => p in zoneKeys);

    if (pongs.length == 0) {
      return { statusCode: 400, payload: { status: "empty" } };
    }

    const anonymousIp = anonymousIpByCC(countryCode);

    let placements = pongs.map((p) => {
      return { name: p, zoneKey: [zoneKeys[p]] };
    });

    const sidedoorZoneKey = zoneKeys.sidedoor;

    // If we have a request for side and top, consider a sidedoor takeover.
    const sidedoorEligible =
      sidedoorZoneKey &&
      ["side", "top"].every((name) =>
        placements.some((placement) => placement.name === name)
      );

    // This will be populated with sidedoor data if all conditions align.
    let sidedoorData = {};
    if (sidedoorEligible) {
      // Make the sidedoor request to the single sidedoor zone
      // The response will be populated with data for both the top and side placement.
      const res = await fetch(
        `https://srv.buysellads.com/ads/${sidedoorZoneKey}.json?forwardedip=${encodeURIComponent(
          anonymousIp
        )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
      );
      try {
        const sidedoorResponse = await res.json();
        const {
          ads: [
            {
              statlink = null,
              statview,

              SidebarDescription,
              SidebarLargeImage,
              SkyscraperImage,
              SideBarImageTitle,
              SidebarBackgroundColor,
              SidebarCallToAction,
              SidebarTextColor,
              SidebarHeading,

              TopBarDescription,
              TopBarImage,
              LeaderboardImage,
              TopBarImageTitle,
              TopBarBackgroundColorDark,
              TopBarBackgroundColorLight,
              TopBarCallToAction,
              TopBarCtaBackgroundColorDark,
              TopBarCtaBackgroundColorLight,
              TopBarCtaTextColorDark,
              TopBarCtaTextColorLight,
              TopBarTextColorDark,
              TopBarTextColorLight,
            },
          ] = [],
        } = sidedoorResponse;

        // If we do not have the `statLink` field present, we do not have placements.
        // A missing `statLink` field represents an 'empty' response.
        if (statlink !== null) {
          // Create side and top bar data objects
          const sideImageFormat = SkyscraperImage
            ? "skyscraper"
            : SidebarLargeImage
              ? "large"
              : "unknown";
          const topImageFormat = LeaderboardImage
            ? "leaderboard"
            : TopBarImage
              ? "image"
              : "unknown";

          const side = {
            click: coder.encodeAndSign(statlink),
            view: coder.encodeAndSign(statview),
            image: coder.encodeAndSign(SkyscraperImage || SidebarLargeImage),
            imageFormat: sideImageFormat,
            alt: SideBarImageTitle && he.decode(SideBarImageTitle),
            copy: SidebarDescription && he.decode(SidebarDescription), // only present on large + image images
            cta: SidebarCallToAction && he.decode(SidebarCallToAction),
            heading: SidebarHeading && he.decode(SidebarHeading),
            colors: {
              textColor: fixupColor(SidebarTextColor),
              backgroundColor: fixupColor(SidebarBackgroundColor),
            },
          };

          const top = {
            click: coder.encodeAndSign(statlink),
            view: coder.encodeAndSign(statview),
            image: coder.encodeAndSign(LeaderboardImage || TopBarImage),
            imageFormat: topImageFormat,
            alt: TopBarImageTitle && he.decode(TopBarImageTitle),
            copy: TopBarDescription && he.decode(TopBarDescription), // only present on large + image images
            cta: TopBarCallToAction && he.decode(TopBarCallToAction),
            colors: {
              textColor: fixupColor(TopBarTextColorLight),
              backgroundColor: fixupColor(TopBarBackgroundColorLight),
              ctaTextColor: fixupColor(TopBarCtaTextColorLight),
              ctaBackgroundColor: fixupColor(TopBarCtaBackgroundColorLight),
              textColorDark: fixupColor(TopBarTextColorDark),
              backgroundColorDark: fixupColor(TopBarBackgroundColorDark),
              ctaTextColorDark: fixupColor(TopBarCtaTextColorDark),
              ctaBackgroundColorDark: fixupColor(TopBarCtaBackgroundColorDark),
            },
          };
          // We have a top and sidebar placement, put it into the sidedoor object.
          sidedoorData = {
            side: side,
            top: top,
          };
        }
      } catch (error) {
        console.error("Error fetching sidedoor data:", error);
      }
    }

    // Now, if we successfully fetched sidedoor data, we need to filter out side and top requests from the
    // placement map:
    if (Object.keys(sidedoorData).length > 0) {
      placements = placements.filter(
        ({ name }) => !["side", "top"].includes(name)
      );
    }

    // Normal request logic commences after the sidedoor logic (sometimes called "Waterfall setup").
    // Any entries left in the placement map will be fetched concurrently.
    // Typically, without a successful sidedoor request, this will be "side", "top" and "bottom" zones.
    // With sidedoor data, typically only "bottom" remains.
    const requests = placements.map(async ({ name, zoneKey }) => {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const response = await fetch(
        `https://srv.buysellads.com/ads/${zoneKey}.json?forwardedip=${encodeURIComponent(
          anonymousIp
        )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
      );
      const res = await response.json();

      const {
        ads: [
          {
            statlink = null,
            statview,
            Description,
            Image,
            LargeImage,
            SkyscraperImage,
            LeaderboardImage,
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
            Heading,
          },
        ] = [],
      } = res;

      const imageFormat = SkyscraperImage
        ? "skyscraper"
        : LeaderboardImage
          ? "leaderboard"
          : LargeImage
            ? "large"
            : Image
              ? "image"
              : "unknown";

      return {
        name,
        p:
          statlink === null
            ? null
            : {
                click: coder.encodeAndSign(statlink),
                view: coder.encodeAndSign(statview),
                image: coder.encodeAndSign(
                  SkyscraperImage || LeaderboardImage || LargeImage || Image
                ),
                imageFormat,
                alt: ImageTitle && he.decode(ImageTitle),
                copy: Description && he.decode(Description), // only present on large + image images
                cta: CallToAction && he.decode(CallToAction),
                heading: Heading && he.decode(Heading),
                colors: {
                  textColor: fixupColor(TextColor || TextColorLight),
                  backgroundColor: fixupColor(
                    BackgroundColor || BackgroundColorLight
                  ),
                  ctaTextColor: fixupColor(CtaTextColorLight),
                  ctaBackgroundColor: fixupColor(CtaBackgroundColorLight),
                  textColorDark: fixupColor(TextColorDark),
                  backgroundColorDark: fixupColor(BackgroundColorDark),
                  ctaTextColorDark: fixupColor(CtaTextColorDark),
                  ctaBackgroundColorDark: fixupColor(CtaBackgroundColorDark),
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

    // merge sidedoorData into decisions
    Object.assign(decisions, sidedoorData);

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
          const {
            copy,
            image,
            imageFormat,
            alt,
            click,
            view,
            cta,
            colors,
            heading,
          } = v;
          return [
            p,
            {
              status: "success",
              copy,
              image,
              imageFormat,
              alt,
              cta,
              colors,
              click,
              view,
              heading,
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
    const code = params.get("code");

    if (!code) {
      console.warn("[pong/click] Missing code parameter");
      return {
        status: 400,
      };
    }

    const click = coder.decodeAndVerify(code);

    if (!click) {
      console.warn("[pong/click] Invalid code value");
      return {
        status: 404,
      };
    }

    const anonymousIp = anonymousIpByCC(countryCode);
    const clickURL = createURL(click);
    clickURL.searchParams.set("forwardedip", anonymousIp);
    clickURL.searchParams.set("useragent", userAgent);

    // eslint-disable-next-line n/no-unsupported-features/node-builtins
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
    const code = params.get("code");

    if (!code) {
      console.warn("[pong/viewed] Missing code parameter");
      return {
        status: 400,
      };
    }

    const view = coder.decodeAndVerify(code);
    if (view) {
      const anonymousIp = anonymousIpByCC(countryCode);
      const viewURL = createURL(view);
      viewURL.searchParams.set("forwardedip", anonymousIp);
      viewURL.searchParams.set("useragent", userAgent);

      // eslint-disable-next-line n/no-unsupported-features/node-builtins
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
