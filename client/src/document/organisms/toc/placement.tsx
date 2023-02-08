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

  const { click, image, copy } = pong?.fallback || pong || {};
  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

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
                href={pong?.fallback?.by || "/"}
                className="pong-note"
                target="_blank"
                rel="noreferrer"
              >
                {pong?.fallback?.by ? "Ads by Carbon" : "Mozilla ads"}
              </a>
            </p>

            <a
              className="no-pong"
              href={user?.isSubscriber ? "/en-US/plus/settings" : "/en-US/plus"}
            >
              Don't want to see ads?
            </a>
          </section>
        </>
      )}
    </>
  );
}
