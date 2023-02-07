import { useCallback, useEffect, useRef } from "react";
import { useIsServer } from "../../../hooks";
import { usePlacementStatus } from "../../../placement-context";
import { useUserData } from "../../../user-context";

export function Placement() {
  const isServer = useIsServer();
  const user = useUserData();
  const pong = usePlacementStatus();

  const observer = useRef<IntersectionObserver | null>(null);
  const place = useCallback(
    (node) => {
      if (pong && node !== null && !observer.current) {
        const observerOptions = {
          root: null,
          rootMargin: "0px",
          threshold: [1],
        };
        const intersectionObserver = new IntersectionObserver((entries) => {
          const [{ isIntersecting = false } = {}] = entries;
          if (isIntersecting && typeof navigator !== "undefined") {
            navigator?.sendBeacon(
              `/pong/viewed?code=${encodeURIComponent(pong?.view)}${
                pong?.fallback
                  ? `&fallback=${encodeURIComponent(pong?.fallback?.view)}`
                  : ""
              }`
            );
            observer.current?.disconnect();
          }
        }, observerOptions);
        observer.current = intersectionObserver;
        intersectionObserver.observe(node);
      }
    },
    [pong]
  );

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  return (
    <>
      {!isServer && pong && (
        <>
          <section ref={place} className="place">
            {pong?.fallback ? (
              <p className="pong-box">
                <a
                  className="pong"
                  href={`/pong/click?code=${encodeURIComponent(
                    pong?.click
                  )}&fallback=${encodeURIComponent(pong?.fallback?.click)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={`/pimg/${encodeURIComponent(pong?.fallback?.image)}`}
                    alt="an ad"
                  ></img>
                  {pong?.fallback?.copy}
                </a>
                <a className="pong-note" href={pong?.fallback?.by}>
                  Ads by Carbon
                </a>
              </p>
            ) : (
              <p className="pong-box">
                <a
                  className="pong"
                  href={`/pong/click?code=${encodeURIComponent(pong?.click)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={`/pimg/${encodeURIComponent(pong?.image || "")}`}
                    alt="an ad"
                  ></img>
                  {pong?.copy}
                </a>
                <a href="/" className="pong-note">
                  Ads by Mozilla
                </a>
              </p>
            )}
            {user?.isSubscriber && (
              <a className="no-pong" href="/en-US/plus/settings">
                Don't wanna see ads?
              </a>
            )}
          </section>
        </>
      )}
    </>
  );
}
