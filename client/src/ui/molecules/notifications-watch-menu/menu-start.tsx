import { WatchMenuItem } from "./atoms/menu-item";

export function NotificationsWatchMenuStart({
  data,
  setStepHandler,
  handleSelection,
  showCustom,
}) {
  const selected: { [x: string]: boolean } = { [data.status]: true };
  const majorText = showCustom
    ? "Only receive notifications of major browser compatability releases and revisions to this article."
    : "Receive notifications of revisions to this article.";

  return (
    <>
      <div className="watch-submenu-header">Notifications</div>

      <WatchMenuItem
        value="major"
        label={
          showCustom
            ? "Major updates"
            : selected.major
            ? "Watching page"
            : "Watch page"
        }
        text={majorText}
        checked={selected.major}
        onClickHandler={() => {
          handleSelection();
        }}
      />

      {showCustom ? (
        <WatchMenuItem
          value="custom"
          label="Custom"
          text={
            selected.custom
              ? "Receiving customized notifications."
              : "Select which events you would like to be notified of."
          }
          checked={selected.custom}
          onClickHandler={(event) => {
            event.preventDefault();
            setStepHandler(1);
          }}
        />
      ) : null}

      <WatchMenuItem
        value="unwatch"
        label={selected.unwatched ? "Not watching" : "Unwatch"}
        text={
          selected.unwatched
            ? "Not receiving notifications about this article."
            : "Stop receiving notifications about this article."
        }
        checked={selected.unwatched}
        onClickHandler={() => {
          handleSelection(true);
        }}
      />
    </>
  );
}
