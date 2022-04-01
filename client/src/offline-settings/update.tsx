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
  const current =
    updateStatus?.currentDate &&
    `Last updated: ${Intl.DateTimeFormat([], { dateStyle: "medium" }).format(
      Date.parse(updateStatus.currentDate)
    )}`;
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
    if (updateStatus?.currentDate) {
      info = "Update available";
      button = (
        <button className="button" onClick={update} disabled={disabled}>
          {" "}
          Update now
        </button>
      );
    } else {
      info =
        "Start using MDN Offline by downloading the latest version of MDN Web Docs";
      button = (
        <button className="button" onClick={update} disabled={disabled}>
          {" "}
          Download
        </button>
      );
    }
  }
  if (updateStatus?.state === STATE.downloading) {
    if (updateStatus?.currentDate) {
      info = "Update in progress…";
    } else {
      info = "Download in progress…";
    }
    button = <button disabled={disabled}>Downloading…</button>;
  }
  if (updateStatus?.state === STATE.unpacking) {
    if (updateStatus?.currentDate) {
      info = "Update in progress…";
    } else {
      info = "Download in progress…";
    }
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
    if (updateStatus?.currentDate) {
      info = "Update in progress…";
    } else {
      info = "Download in progress…";
    }
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
