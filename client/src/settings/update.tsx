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
    case ContentStatusPhase.INITIAL:
      info = "Checking for updates";
      break;

    case ContentStatusPhase.IDLE:
      if (updateStatus?.local?.version === updateStatus?.remote?.latest) {
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

    case ContentStatusPhase.DOWNLOAD:
      if (updateStatus?.local) {
        info = "Update in progress…";
      } else {
        info = "Download in progress…";
      }
      button = <button disabled={disabled}>Downloading…</button>;
      break;

    case ContentStatusPhase.UNPACK:
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

    case ContentStatusPhase.CLEAR:
      info = "Clearing…";
      break;
  }

  return (
    <section aria-labelledby="update-status">
      <h3 id="update-status">Update status</h3>
      <div className="setting-row">
        <span>
          {current}
          {current && <br />}
          {info}
        </span>
        {button}
      </div>
    </section>
  );
}
