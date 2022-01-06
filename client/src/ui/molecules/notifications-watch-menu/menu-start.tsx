import { WatchMenuItem } from "./atoms/menu-item";

export function NotificationsWatchMenuStart({
  data,
  setStepHandler,
  handleSelection,
}) {
  const selected: { [x: string]: boolean } = { [data.status]: true };

  return (
    <>
      <div className="watch-submenu-header">Notifications</div>

      <WatchMenuItem
        value="major"
        label="Major updates"
        text="Only receive notifications of major browser compatability releases and revisions to this article."
        checked={selected.major}
        onClickHandler={() => {
          handleSelection();
        }}
      />

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
