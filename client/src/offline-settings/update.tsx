import { ContentStatus, ContentStatusPhase } from "./db";

export default function UpdateButton({
  updateStatus,
  update,
  disabled = false,
}: {
  updateStatus: ContentStatus | null;
  update: () => void;
  disabled?: boolean;
}) {
  const current =
    updateStatus?.local?.date &&
    `Last updated: ${Intl.DateTimeFormat([], { dateStyle: "medium" }).format(
      Date.parse(updateStatus?.local?.date)
    )}`;
  let button: JSX.Element | null = null;
  let info: string | undefined;

  switch (updateStatus?.phase) {
    case ContentStatusPhase.initial:
      info = "Checking for updates";
      break;

    case ContentStatusPhase.idle:
      if (updateStatus?.local?.version === updateStatus?.remote?.version) {
        info = "Your content is up to date";
        button = <button disabled>Up to date</button>;
      } else {
        if (updateStatus?.local) {
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
      break;

    case ContentStatusPhase.download:
      if (updateStatus?.local) {
        info = "Update in progress…";
      } else {
        info = "Download in progress…";
      }
      button = <button disabled={disabled}>Downloading…</button>;
      break;

    case ContentStatusPhase.unpack:
      if (updateStatus?.local) {
        info = "Update in progress…";
      } else {
        info = "Download in progress…";
      }
      const progress = (updateStatus?.progress || 0) * 100;
      button = (
        <button disabled={disabled}>
          Unpacking…{" "}
          {progress?.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}
          %
        </button>
      );
      break;

    case ContentStatusPhase.clear:
      info = "Clearing…";
      break;
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
