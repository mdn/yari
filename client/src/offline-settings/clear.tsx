import { STATE, UpdateStatus } from "./mdn-worker";

export default function ClearButton({
  updateStatus,
  clear,
  disabled = false,
}: {
  updateStatus: UpdateStatus | null;
  clear: () => void;
  disabled?: boolean;
}) {
  let button;
  if (
    (updateStatus?.state === STATE.nothing ||
      updateStatus?.state === STATE.updateAvailable) &&
    updateStatus?.currentVersion !== null
  ) {
    button = (
      <button className="button" onClick={clear} disabled={disabled}>
        Clear data
      </button>
    );
  } else if (updateStatus?.state === STATE.clearing) {
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
