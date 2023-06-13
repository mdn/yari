import { useCallback, useEffect, useRef } from "react";
import { useIsServer, usePageVisibility } from "../../../hooks";
import { User, useUserData } from "../../../user-context";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";
import {
  PlacementData,
  Status,
  usePlacement,
} from "../../../placement-context";
import { BANNER_BLOG_LAUNCH_CLICK } from "../../../telemetry/constants";

interface Timer {
  timeout: number | null;
  start: number | null;
  notVisible?: boolean;
}

interface PlacementRenderArgs {
  place: any;
  extraClassNames?: string[];
  click: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  copy?: string;
  cta?: string;
  user: User;
  style: object;
}

function viewed(
  pong: PlacementData,
  observer: IntersectionObserver | null = null
) {
  navigator?.sendBeacon?.(
    `/pong/viewed?code=${encodeURIComponent(pong?.view)}${
      pong?.fallback
        ? `&fallback=${encodeURIComponent(pong?.fallback?.view)}`
        : ""
    }`
  );
  observer?.disconnect();
}

export function SidePlacement() {
  const placementData = usePlacement();

  return !placementData?.side ? (
    <section className="place side"></section>
  ) : (
    <PlacementInner
      pong={placementData.side}
      extraClassNames={["side"]}
      imageWidth={130}
      imageHeight={100}
      renderer={RenderSideOrTopBanner}
    ></PlacementInner>
  );
}

function Fallback() {
  const gleanClick = useGleanClick();

  return (
    <p className="fallback-copy">
      Discover the latest web development insights on our new{" "}
      <a
        href="/en-US/blog/"
        onClick={() => {
          gleanClick(BANNER_BLOG_LAUNCH_CLICK);
        }}
      >
        MDN Blog
      </a>
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
            <Fallback />
          )}
        </section>
      ) : (
        <PlacementInner
          pong={placementData.top}
          extraClassNames={["top", "container"]}
          cta={placementData.top?.cta}
          imageHeight={50}
          renderer={RenderSideOrTopBanner}
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
  });
}

export function HpFooterPlacement() {
  const placementData = usePlacement();
  return HpPlacement({
    placementData: placementData?.hpFooter,
    imageWidth: 728,
    imageHeight: 90,
  });
}

function HpPlacement({
  placementData,
  imageWidth,
  imageHeight,
}: {
  placementData?: PlacementData;
  imageWidth: number;
  imageHeight: number;
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
    ></PlacementInner>
  );
}

export function PlacementInner({
  pong,
  extraClassNames = [],
  cta,
  imageWidth,
  imageHeight,
  style,
  renderer,
}: {
  pong: PlacementData;
  extraClassNames?: string[];
  cta?: string;
  imageWidth?: number;
  imageHeight?: number;
  style?: object;
  renderer: (PlacementRenderArgs) => JSX.Element;
}) {
  const isServer = useIsServer();
  const user = useUserData();
  const isVisible = usePageVisibility();
  const gleanClick = useGleanClick();

  const observer = useRef<IntersectionObserver | null>(null);
  const timer = useRef<Timer>({ timeout: null, start: null });
  const place = useCallback(
    (node) => {
      if (pong && node !== null && !observer.current) {
        const observerOptions = {
          root: null,
          rootMargin: "0px",
          threshold: [0.5],
        };
        const intersectionObserver = new IntersectionObserver((entries) => {
          const [{ isIntersecting = false, intersectionRatio = 0 } = {}] =
            entries;
          if (isIntersecting && intersectionRatio >= 0.5) {
            if (timer.current.timeout === null) {
              timer.current = {
                timeout: window?.setTimeout?.(() => {
                  viewed(pong, observer?.current);
                  gleanClick("pong: pong->viewed");
                  timer.current = { timeout: -1, start: -1 };
                }, 1000),
                start: Date.now(),
              };
            }
          } else if (
            !isIntersecting &&
            intersectionRatio <= 0.5 &&
            timer.current.timeout !== null
          ) {
            clearTimeout(timer.current.timeout);
            timer.current = { timeout: null, start: null };
          }
        }, observerOptions);
        observer.current = intersectionObserver;
        intersectionObserver.observe(node);
      }
    },
    [pong, gleanClick]
  );

  const { image, copy } = pong?.fallback || pong || {};
  const { click } = pong || {};
  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  useEffect(() => {
    if (timer.current.timeout !== -1) {
      // timeout !== -1 means the viewed has been sent
      if (!isVisible && timer.current.timeout !== null) {
        clearTimeout(timer.current.timeout);
        timer.current = { timeout: null, start: null, notVisible: true };
      } else if (
        isVisible &&
        pong &&
        timer.current.notVisible &&
        timer.current.timeout === null
      ) {
        timer.current = {
          timeout: window?.setTimeout?.(
            () => viewed(pong, observer?.current),
            1000
          ),
          start: Date.now(),
        };
      }
    }
  }, [isVisible, pong]);

  return (
    <>
      {!isServer &&
        click &&
        image &&
        renderer({
          place,
          extraClassNames,
          click,
          image,
          imageWidth,
          imageHeight,
          copy,
          cta,
          user,
          style,
        })}
    </>
  );
}

function RenderSideOrTopBanner({
  place,
  extraClassNames = [],
  click,
  image,
  imageWidth,
  imageHeight,
  copy,
  cta,
  user,
  style,
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
          data-pong="pong->click"
          href={`/pong/click?code=${encodeURIComponent(click)}`}
          target="_blank"
          rel="noreferrer"
        >
          <img
            src={`/pimg/${encodeURIComponent(image || "")}`}
            aria-hidden="true"
            alt=""
            width={imageWidth}
            height={imageHeight}
          ></img>
          <span>{copy}</span>
        </a>
        {cta && (
          <a
            className="pong-cta"
            data-pong="pong->click"
            href={`/pong/click?code=${encodeURIComponent(click)}`}
            target="_blank"
            rel="noreferrer"
          >
            {cta}
          </a>
        )}
        <a
          href="/en-US/advertising"
          className="pong-note"
          data-pong="pong->about"
          target="_blank"
          rel="noreferrer"
        >
          Mozilla ads
        </a>
      </p>

      <a
        className="no-pong"
        data-pong={user?.isSubscriber ? "pong->settings" : "pong->plus"}
        href={
          user?.isSubscriber
            ? "/en-US/plus/settings?ref=nope"
            : "/en-US/plus?ref=nope#subscribe"
        }
      >
        Don't want to see ads?
      </a>
    </section>
  );
}

function RenderHpPlacement({
  place,
  extraClassNames = [],
  click,
  image,
  imageWidth,
  imageHeight,
  copy,
  style,
}: PlacementRenderArgs) {
  return (
    <section
      ref={place}
      className={["place", ...extraClassNames].join(" ")}
      style={style}
    >
      <a
        className="pong"
        data-pong="pong->click"
        href={`/pong/click?code=${encodeURIComponent(click)}`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          src={`/pimg/${encodeURIComponent(image || "")}`}
          alt={copy}
          width={imageWidth}
          height={imageHeight}
        ></img>
      </a>
    </section>
  );
}
