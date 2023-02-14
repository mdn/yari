import { useCallback, useEffect, useRef } from "react";
import { useIsServer, usePageVisibility } from "../../../hooks";
import {
  PlacementStatus,
  usePlacementStatus,
} from "../../../placement-context";
import { useUserData } from "../../../user-context";

interface Timer {
  timeout: number | null;
  start: number | null;
  notVisible?: boolean;
}

function viewed(
  pong: PlacementStatus,
  observer: IntersectionObserver | null = null
) {
  navigator?.sendBeacon(
    `/pong/viewed?code=${encodeURIComponent(pong?.view)}${
      pong?.fallback
        ? `&fallback=${encodeURIComponent(pong?.fallback?.view)}`
        : ""
    }`
  );
  observer?.disconnect();
}

export function Placement() {
  const isServer = useIsServer();
  const user = useUserData();
  const pong = usePlacementStatus();
  const isVisible = usePageVisibility();

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
          if (
            isIntersecting &&
            intersectionRatio >= 0.5 &&
            typeof navigator !== "undefined" &&
            typeof window !== "undefined"
          ) {
            if (timer.current.timeout === null) {
              timer.current = {
                timeout: window.setTimeout(
                  () => viewed(pong, observer?.current),
                  1000
                ),
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
    [pong]
  );

  const { click, image, copy } = pong?.fallback || pong || {};
  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible && timer.current.timeout !== null) {
      clearTimeout(timer.current.timeout);
      timer.current = { timeout: null, start: null, notVisible: true };
    } else if (
      isVisible &&
      pong &&
      timer.current.notVisible &&
      timer.current.timeout === null &&
      typeof window !== "undefined"
    ) {
      timer.current = {
        timeout: window.setTimeout(() => viewed(pong, observer?.current), 1000),
        start: Date.now(),
      };
    }
  }, [isVisible, pong]);

  return (
    <>
      {!isServer && click && image && copy && (
        <>
          <section ref={place} className="place">
            <p className="pong-box">
              <a
                className="pong"
                href={`/pong/click?code=${encodeURIComponent(click)}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={`/pimg/${encodeURIComponent(image || "")}`}
                  alt="an ad"
                ></img>
                <span>{pong?.copy}</span>
              </a>
              <a
                href={pong?.fallback?.by || "/en-US/advertisement"}
                className="pong-note"
                target="_blank"
                rel="noreferrer"
              >
                {pong?.fallback?.by ? "Ads by Carbon" : "Mozilla ads"}
              </a>
            </p>

            <a
              className="no-pong"
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
