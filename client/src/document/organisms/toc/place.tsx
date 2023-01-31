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
            navigator?.sendBeacon(`/pong/viewed?code=${pong?.impression}`);
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
          <a
            className="pong"
            href={`/pong/click?code=${pong?.click}`}
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
        </section>
      )}
    </>
  );
}
