import { STATE, UpdateStatus } from "./mdn-worker";

export default function UpdateButton({
  updateStatus,
  update,
  disabled = false,
}: {
  updateStatus: UpdateStatus | null;
  update: () => void;
  disabled?: boolean;
}) {
  const current = `Last updated: ${
    updateStatus?.currentDate
      ? Intl.DateTimeFormat([], { dateStyle: "medium" }).format(
          Date.parse(updateStatus.currentDate)
        )
      : "never"
  }`;
  let button: JSX.Element | null = null;
  let info: string | undefined;
  let progress = (updateStatus?.progress || 0) * 100;
  if (!updateStatus || updateStatus?.state === STATE.init) {
    info = "Checking for updates";
  }
  if (updateStatus?.state === STATE.nothing) {
    info = "Your content is up to date";
    button = <button disabled>Up to date</button>;
  }
  if (updateStatus?.state === STATE.updateAvailable) {
    info = "Update available";
    button = (
      <button onClick={update} disabled={disabled}>
        {" "}
        Update now
      </button>
    );
  }
  if (updateStatus?.state === STATE.downloading) {
    info = "Update in progress…";
    button = <button disabled={disabled}>Downloading…</button>;
  }
  if (updateStatus?.state === STATE.unpacking) {
    info = "Update in progress…";
    button = (
      <button disabled={disabled}>
        Unpacking…{" "}
        {progress?.toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
        %
      </button>
    );
  }
  if (updateStatus?.state === STATE.cleaning) {
    info = "Update in progress…";
    button = <button disabled>Cleaning…</button>;
  }
  if (updateStatus?.state === STATE.clearing) {
    info = "Clearing…";
  }

  return (
    <>
      <h4>Update status</h4>
      <span>
        {current}
        <br />
        {info}
      </span>
      {button}
    </>
  );
}
