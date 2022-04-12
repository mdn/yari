import { ContentStatus, ContentStatusPhase } from "./db";

export default function ClearButton({
  updateStatus,
  clear,
  disabled = false,
}: {
  updateStatus: ContentStatus | null;
  clear: () => void;
  disabled?: boolean;
}) {
  let button;
  if (updateStatus?.phase === ContentStatusPhase.idle && updateStatus?.local) {
    button = (
      <button className="button" onClick={clear} disabled={disabled}>
        Clear data
      </button>
    );
  } else if (updateStatus?.phase === ContentStatusPhase.clear) {
    button = <button disabled>Clearing…</button>;
  } else {
    button = (
      <button className="button" disabled>
        Clear data
      </button>
    );
  }

  return <>{button}</>;
}
