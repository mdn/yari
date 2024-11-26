import { useIsServer, useViewed } from "../../../hooks";
import { User, useUserData } from "../../../user-context";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import { Status, usePlacement } from "../../../placement-context";
import { Payload as PlacementData } from "../../../../../libs/pong/types";
import {
  BANNER_SCRIMBA_CLICK,
  BANNER_SCRIMBA_VIEW,
} from "../../../telemetry/constants";

interface PlacementRenderArgs {
  place: any;
  extraClassNames?: string[];
  click: string;
  image: string;
  alt?: string;
  imageWidth: number;
  imageHeight: number;
  copy?: string;
  cta?: string;
  user: User;
  style: object;
  version?: number;
  typ: string;
  heading?: string;
  showNoAds: boolean;
}

function viewed(pong?: PlacementData) {
  pong?.view &&
    navigator.sendBeacon?.(
      `/pong/viewed?code=${encodeURIComponent(pong?.view)}${
        pong?.version ? `&version=${pong.version}` : ""
      }`
    );
}

export function SidePlacement() {
  const placementData = usePlacement();
  const { textColor, backgroundColor, textColorDark, backgroundColorDark } =
    placementData?.side?.colors || {};
  const css = Object.fromEntries(
    [
      ["--place-new-side-background-light", backgroundColor],
      ["--place-new-side-color-light", textColor],
      [
        "--place-new-side-background-dark",
        backgroundColorDark || backgroundColor,
      ],
      ["--place-new-side-color-dark", textColorDark || textColor],
    ].filter(([_, v]) => Boolean(v))
  );

  return !placementData?.side ? (
    <section className="place side"></section>
  ) : placementData.side.cta && placementData.side.heading ? (
    <PlacementInner
      pong={placementData.side}
      extraClassNames={["side", "new-side"]}
      imageWidth={125}
      imageHeight={125}
      cta={placementData.side.cta}
      renderer={RenderNewSideBanner}
      typ="side"
      style={css}
    ></PlacementInner>
  ) : (
    <PlacementInner
      pong={placementData.side}
      extraClassNames={["side"]}
      imageWidth={130}
      imageHeight={100}
      renderer={RenderSideOrTopBanner}
      typ="side"
    ></PlacementInner>
  );
}

function TopPlacementFallbackContent() {
  const gleanClick = useGleanClick();
  const observedNode = useViewed(() => {
    gleanClick(BANNER_SCRIMBA_VIEW);
  });
  const now = Date.now();

  return now < Date.parse("2024-12-01") ? (
    <p className="fallback-copy">
      Learn front-end with MDN’s course partner{" "}
      <a
        href="https://scrimba.com/learn/frontend?via=mdn"
        target="_blank"
        rel="noreferrer"
        ref={observedNode}
        onClick={() => {
          gleanClick(BANNER_SCRIMBA_CLICK);
        }}
      >
        Scrimba
      </a>{" "}
      - 30% discount this week!
    </p>
  ) : now < Date.parse("2024-12-25") ? (
    <p className="fallback-copy">
      Take our daily challenges until 24th December and win exciting prizes.{" "}
      <a
        href="https://scrimba.com/learn/frontend?via=mdn"
        target="_blank"
        rel="noreferrer"
        ref={observedNode}
        onClick={() => {
          gleanClick(BANNER_SCRIMBA_CLICK);
        }}
      >
        Join now
      </a>
    </p>
  ) : (
    <p className="fallback-copy">
      Learn front-end development with high quality, interactive courses from{" "}
      <a
        href="https://scrimba.com/learn/frontend?via=mdn"
        target="_blank"
        rel="noreferrer"
        ref={observedNode}
        onClick={() => {
          gleanClick(BANNER_SCRIMBA_CLICK);
        }}
      >
        Scrimba
      </a>
      . Enroll now!
    </p>
  );
}

export function TopPlacement() {
  const isServer = useIsServer();
  const placementData = usePlacement();
  const {
    textColor,
    backgroundColor,
    ctaTextColor,
    ctaBackgroundColor,
    textColorDark,
    backgroundColorDark,
    ctaTextColorDark,
    ctaBackgroundColorDark,
  } = placementData?.top?.colors || {};
  const css = Object.fromEntries(
    [
      ["--place-top-background-light", backgroundColor],
      ["--place-top-color-light", textColor],
      ["--place-top-cta-background-light", ctaBackgroundColor],
      ["--place-top-cta-color-light", ctaTextColor],
      ["--place-top-background-dark", backgroundColorDark || backgroundColor],
      ["--place-top-color-dark", textColorDark || textColor],
      [
        "--place-top-cta-background-dark",
        ctaBackgroundColorDark || ctaBackgroundColor,
      ],
      ["--place-top-cta-color-dark", ctaTextColorDark || ctaBackgroundColor],
    ].filter(([_, v]) => Boolean(v))
  );

  const status =
    isServer || placementData?.status === Status.loading
      ? "loading"
      : placementData?.top
        ? "visible"
        : "fallback";

  return (
    <div className={`top-banner ${status}`} style={css}>
      {isServer || !placementData?.top ? (
        <section className="place top container">
          {!isServer && placementData?.status !== Status.loading && (
            <TopPlacementFallbackContent />
          )}
        </section>
      ) : (
        <PlacementInner
          pong={placementData.top}
          extraClassNames={["top", "container"]}
          cta={placementData.top?.cta}
          imageHeight={50}
          renderer={RenderSideOrTopBanner}
          typ="top-banner"
        ></PlacementInner>
      )}
    </div>
  );
}

export function HpMainPlacement() {
  const placementData = usePlacement();
  return HpPlacement({
    placementData: placementData?.hpMain,
    imageWidth: 970,
    imageHeight: 250,
    typ: "hp-main",
  });
}

export function HpFooterPlacement() {
  const placementData = usePlacement();
  return HpPlacement({
    placementData: placementData?.hpFooter,
    imageWidth: 728,
    imageHeight: 90,
    typ: "hp-footer",
  });
}

function HpPlacement({
  placementData,
  imageWidth,
  imageHeight,
  typ,
}: {
  placementData?: PlacementData;
  imageWidth: number;
  imageHeight: number;
  typ: string;
}) {
  const { backgroundColor } = placementData?.colors || {};
  const css = Object.fromEntries(
    [["--place-hp-main-background", backgroundColor]].filter(([_, v]) =>
      Boolean(v)
    )
  );
  return !placementData ? (
    <section className="place hp-main"></section>
  ) : (
    <PlacementInner
      pong={placementData}
      extraClassNames={["hp-main"]}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      style={css}
      renderer={RenderHpPlacement}
      typ={typ}
    ></PlacementInner>
  );
}

export function BottomBanner() {
  const placementData = usePlacement()?.bottom;
  const { backgroundColor, textColor } = placementData?.colors || {};
  const css = Object.fromEntries(
    [
      ["--place-bottom-banner-background", backgroundColor],
      ["--place-bottom-banner-color", textColor],
    ].filter(([_, v]) => Boolean(v))
  );
  return placementData ? (
    <PlacementInner
      pong={placementData}
      imageWidth={728}
      imageHeight={90}
      style={css}
      renderer={RenderBottomBanner}
      typ="bottom-banner"
    ></PlacementInner>
  ) : null;
}

export function PlacementInner({
  pong,
  extraClassNames = [],
  cta,
  imageWidth,
  imageHeight,
  style,
  renderer,
  typ,
}: {
  pong?: PlacementData;
  extraClassNames?: string[];
  cta?: string;
  imageWidth?: number;
  imageHeight?: number;
  style?: object;
  renderer: (PlacementRenderArgs) => JSX.Element;
  typ: string;
}) {
  const isServer = useIsServer();
  const user = useUserData();
  const gleanClick = useGleanClick();
  const { plusAvailable } = usePlacement() || {};
  const showNoAds = Boolean(user?.isSubscriber || plusAvailable);

  const place = useViewed(() => {
    viewed(pong);
    gleanClick(`pong: pong->viewed ${typ}`);
  });

  const { image, copy, alt, click, version, heading } = pong || {};
  return (
    <>
      {!isServer &&
        ((click && image) || pong?.status === Status.empty) &&
        renderer({
          place,
          extraClassNames,
          click,
          image,
          alt,
          imageWidth,
          imageHeight,
          copy,
          cta,
          user,
          style,
          version,
          typ,
          heading,
          showNoAds,
        })}
    </>
  );
}

function RenderSideOrTopBanner({
  place,
  extraClassNames = [],
  click,
  image,
  alt,
  imageWidth,
  imageHeight,
  copy,
  cta,
  user,
  style,
  version = 1,
  typ,
  showNoAds,
}: PlacementRenderArgs) {
  return (
    <section
      ref={place}
      className={["place", ...extraClassNames].join(" ")}
      style={style}
    >
      <p className="pong-box">
        <a
          className="pong"
          data-glean={`pong: pong->click ${typ}`}
          href={`/pong/click?code=${encodeURIComponent(
            click
          )}&version=${version}`}
          target="_blank"
          rel="sponsored noreferrer"
        >
          <img
            src={`/pimg/${encodeURIComponent(image || "")}`}
            aria-hidden={!Boolean(alt)}
            alt={alt || ""}
            width={imageWidth}
            height={imageHeight}
          ></img>
          <span>{copy}</span>
        </a>
        {cta && (
          <a
            className="pong-cta"
            data-glean={`pong: pong->click ${typ}`}
            href={`/pong/click?code=${encodeURIComponent(
              click
            )}&version=${version}`}
            target="_blank"
            rel="sponsored noreferrer"
          >
            {cta}
          </a>
        )}
        <a
          href="/en-US/advertising"
          className="pong-note"
          data-glean="pong: pong->about"
          target="_blank"
          rel="noreferrer"
        >
          Mozilla ads
        </a>
      </p>

      {showNoAds && (
        <a
          className="no-pong"
          data-glean={
            "pong: " + (user?.isSubscriber ? "pong->settings" : "pong->plus")
          }
          href={
            user?.isSubscriber
              ? "/en-US/plus/settings?ref=nope"
              : "/en-US/plus?ref=nope"
          }
        >
          Don't want to see ads?
        </a>
      )}
    </section>
  );
}

function RenderHpPlacement({
  place,
  extraClassNames = [],
  click,
  image,
  alt,
  imageWidth,
  imageHeight,
  copy,
  style,
  version = 1,
  typ,
}: PlacementRenderArgs) {
  return (
    <section
      ref={place}
      className={["place", ...extraClassNames].join(" ")}
      style={style}
    >
      <a
        className="pong"
        data-glean={`pong: pong->click ${typ}`}
        href={`/pong/click?code=${encodeURIComponent(
          click
        )}&version=${version}`}
        target="_blank"
        rel="sponsored noreferrer"
      >
        <img
          src={`/pimg/${encodeURIComponent(image || "")}`}
          alt={alt || copy}
          width={imageWidth}
          height={imageHeight}
        ></img>
      </a>
    </section>
  );
}

function RenderBottomBanner({
  place,
  extraClassNames = [],
  click,
  image,
  alt,
  imageWidth,
  imageHeight,
  copy,
  user,
  style,
  version = 1,
  typ,
  showNoAds,
}: PlacementRenderArgs) {
  return (
    <div className="bottom-banner-container" style={style}>
      <section
        ref={place}
        className={["place", "bottom-banner", ...extraClassNames].join(" ")}
      >
        <a
          className="pong"
          data-glean={`pong: pong->click ${typ}`}
          href={`/pong/click?code=${encodeURIComponent(
            click
          )}&version=${version}`}
          target="_blank"
          rel="sponsored noreferrer"
        >
          <img
            src={`/pimg/${encodeURIComponent(image || "")}`}
            alt={alt || copy}
            width={imageWidth}
            height={imageHeight}
          ></img>
        </a>
        <a
          href="/en-US/advertising"
          className="pong-note"
          data-glean="pong: pong->about"
          target="_blank"
          rel="noreferrer"
        >
          Mozilla ads
        </a>
        {showNoAds && (
          <a
            className="no-pong"
            data-glean={
              "pong: " + (user?.isSubscriber ? "pong->settings" : "pong->plus")
            }
            href={
              user?.isSubscriber
                ? "/en-US/plus/settings?ref=nope"
                : "/en-US/plus?ref=nope"
            }
          >
            Don't want to see ads?
          </a>
        )}
      </section>
    </div>
  );
}

function RenderNewSideBanner({
  place,
  extraClassNames = [],
  click,
  image,
  alt,
  imageWidth,
  imageHeight,
  copy,
  cta,
  user,
  style,
  version = 1,
  typ,
  heading,
  showNoAds,
}: PlacementRenderArgs) {
  return (
    <section ref={place} className={["place", ...extraClassNames].join(" ")}>
      <div className="pong-box2" style={style}>
        <a
          className="pong"
          data-glean={`pong: pong->click ${typ}`}
          href={`/pong/click?code=${encodeURIComponent(
            click
          )}&version=${version}`}
          target="_blank"
          rel="sponsored noreferrer"
        >
          <img
            src={`/pimg/${encodeURIComponent(image || "")}`}
            aria-hidden={!Boolean(alt)}
            alt={alt || ""}
            width={imageWidth}
            height={imageHeight}
          ></img>
          <div className="content">
            <strong>{heading}</strong>
            <span>{copy}</span>
            {cta && <span className="pong-cta external">{cta}</span>}
          </div>
        </a>
        <a
          href="/en-US/advertising"
          className="pong-note"
          data-glean="pong: pong->about"
          target="_blank"
          rel="noreferrer"
        >
          Ad
        </a>
      </div>

      {showNoAds && (
        <a
          className="no-pong"
          data-glean={
            "pong: " + (user?.isSubscriber ? "pong->settings" : "pong->plus")
          }
          href={
            user?.isSubscriber
              ? "/en-US/plus/settings?ref=nope"
              : "/en-US/plus?ref=nope"
          }
        >
          Don't want to see ads?
        </a>
      )}
    </section>
  );
}
