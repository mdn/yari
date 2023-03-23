import { useCallback, useEffect, useRef } from "react";
import { PLACEMENT_ENABLED } from "../../../env";
import { useIsServer, usePageVisibility } from "../../../hooks";
import useSWR from "swr";
import { useUserData } from "../../../user-context";

import "./index.scss";
import { useGleanClick } from "../../../telemetry/glean-context";

interface Timer {
  timeout: number | null;
  start: number | null;
  notVisible?: boolean;
}

enum Status {
  success = "success",
  geoUnsupported = "geo_unsupported",
  capReached = "cap_reached",
}

export interface Fallback {
  click: string;
  view: string;
  copy: string;
  image: string;
  by: string;
}

interface PlacementError {
  status: Status;
}

export interface PlacementStatus {
  status: Status;
  click: string;
  view: string;
  copy?: string;
  image?: string;
  fallback?: Fallback;
}

function viewed(
  pong: PlacementStatus,
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

export function Placement() {
  const user = useUserData();
  const gleanClick = useGleanClick();
  const {
    data: pong,
    isLoading,
    isValidating,
  } = useSWR<PlacementStatus | PlacementError>(
    !PLACEMENT_ENABLED || user?.settings?.noAds ? null : "/pong/get",
    async (url) => {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keywords: [] }),
      });

      gleanClick(`pong: pong->fetched ${response.status}`);

      if (!response.ok) {
        throw Error(response.statusText);
      }

      try {
        const placementResponse: PlacementStatus | PlacementError =
          await response.json();
        gleanClick(`pong: pong->status ${placementResponse.status}`);
        return placementResponse;
      } catch (e) {
        throw Error(response.statusText);
      }
    },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return isLoading || isValidating ? null : (
    <PlacementInner pong={pong}></PlacementInner>
  );
}

export function PlacementInner({ pong }) {
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
      {!isServer && click && image && copy && (
        <>
          <section ref={place} className="place">
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
                ></img>
                <span>{pong?.copy}</span>
              </a>
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
