import { STATE, UpdateStatus } from "./mdn-worker";

export default function ClearButton({
  updateStatus,
  clear,
}: {
  updateStatus: UpdateStatus | null;
  clear: () => void;
}) {
  let button;
  if (
    (updateStatus?.state === STATE.nothing ||
      updateStatus?.state === STATE.updateAvailable) &&
    updateStatus?.currentVersion !== null
  ) {
    button = <button onClick={clear}>Clear data</button>;
  } else if (updateStatus?.state === STATE.clearing) {
    button = <button disabled>Clearing…</button>;
  } else {
    button = <button disabled>Clear data</button>;
  }

  return <>{button}</>;
}
