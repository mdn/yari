import { useCallback, useEffect, useRef } from "react";
import { useIsServer, usePageVisibility } from "../../../hooks";
import { useUserData } from "../../../user-context";

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
    ></PlacementInner>
  );
}

function Fallback() {
  const gleanClick = useGleanClick();

  return (
    <p className="mdn-cta-copy">
      Discover the latest web dev insights on our new{" "}
      <a
        href="/en-US/blog/"
        onClick={() => {
          gleanClick(BANNER_BLOG_LAUNCH_CLICK);
        }}
      >
        MDN Blog
      </a>
      .
    </p>
  );
}

export function TopPlacement() {
  const placementData = usePlacement();
  const { textColor, backgroundColor, ctaTextColor, ctaBackgroundColor } =
    placementData?.top?.colors || {};
  const css = Object.fromEntries(
    [
      ["--place-top-background", backgroundColor],
      ["--place-top-color", textColor],
      ["--place-top-cta-background", ctaBackgroundColor],
      ["--place-top-cta-color", ctaTextColor],
    ].filter(([_, v]) => Boolean(v))
  );

  const status =
    placementData?.status === Status.loading
      ? "loading"
      : placementData?.top
      ? "visible"
      : "fallback";

  return (
    <div className={`top-banner ${status}`} style={css}>
      {!placementData?.top ? (
        <section className="place top container">
          {placementData?.status !== Status.loading && <Fallback />}
        </section>
      ) : (
        <PlacementInner
          pong={placementData.top}
          extraClassNames={["top", "container"]}
          cta={placementData.top?.cta}
          imageHeight={50}
        ></PlacementInner>
      )}
    </div>
  );
}

export function PlacementInner({
  pong,
  extraClassNames = [],
  cta,
  imageWidth,
  imageHeight,
}: {
  pong: PlacementData;
  extraClassNames?: string[];
  cta?: string;
  imageWidth?: number;
  imageHeight?: number;
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
      {!isServer && click && image && (
        <>
          <section
            ref={place}
            className={["place", ...extraClassNames].join(" ")}
          >
            <p className="pong-box">
              <a
                className="pong"
                data-pong="pong->click"
                href={`/pong/click?code=${encodeURIComponent(click)}${
                  pong?.fallback
                    ? `&fallback=${encodeURIComponent(pong?.fallback?.view)}`
                    : ""
                }`}
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
                  href={`/pong/click?code=${encodeURIComponent(click)}${
                    pong?.fallback
                      ? `&fallback=${encodeURIComponent(pong?.fallback?.view)}`
                      : ""
                  }`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {cta}
                </a>
              )}
              <a
                href={pong?.fallback?.by || "/en-US/advertising"}
                className="pong-note"
                data-pong="pong->about"
                target="_blank"
                rel="noreferrer"
              >
                {pong?.fallback?.by ? "Ads by Carbon" : "Mozilla ads"}
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
        </>
      )}
    </>
  );
}
