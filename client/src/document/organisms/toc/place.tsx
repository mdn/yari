import { useCallback, useEffect, useRef } from "react";
import { useIsServer } from "../../../hooks";
import { usePlacementStatus } from "../../../placement-context";
import { useUserData } from "../../../user-context";

export function Place() {
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
              `/pong/viewed?code=${encodeURIComponent(pong?.impression)}${
                pong?.fallback
                  ? `&fallback=${encodeURIComponent(pong?.fallback?.click)}`
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
        <section ref={place} className="place">
          {pong?.fallback ? (
            <>
              <a
                className="pong"
                href={`/pong/click?code=${encodeURIComponent(
                  pong?.click
                )}&fallback=${encodeURIComponent(pong?.fallback?.click)}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={`data:image/png;base64,${pong?.fallback?.image}`}
                  alt="an ad"
                ></img>
                {pong?.fallback?.copy}
              </a>
              <p className="pong-note-container">
                {user?.isSubscriber && (
                  <a className="no-pong" href="/en-US/plus/settings">
                    No Ads
                  </a>
                )}
                <a href={pong?.fallback?.by} className="pong-note">
                  Ads by Carbon
                </a>
              </p>
            </>
          ) : (
            <>
              <a
                className="pong"
                href={`/pong/click?code=${encodeURIComponent(pong?.click)}`}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: `${pong?.contents?.[0]?.body}`,
                  }}
                />
                {pong?.contents?.[0]?.data?.customData?.copy}
              </a>
              <p className="pong-note-container">
                {user?.isSubscriber && (
                  <a className="no-pong" href="/en-US/plus/settings">
                    No Ads
                  </a>
                )}
                <span className="pong-note">Ads by Mozilla</span>
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}
