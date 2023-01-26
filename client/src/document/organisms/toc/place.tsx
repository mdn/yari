import { useIsServer } from "../../../hooks";
import { usePlacementStatus } from "../../../placement-context";

export function Place() {
  const isServer = useIsServer();

  const pong = usePlacementStatus();

  return (
    <>
      {!isServer && pong && (
        <section className="place">
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
          <span className="pong-note">Ads by Mozilla</span>
        </section>
      )}
    </>
  );
}
