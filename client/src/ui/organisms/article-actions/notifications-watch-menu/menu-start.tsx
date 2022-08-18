import { WatchMenuItem } from "./menu-item";
import { Icon } from "../../../atoms/icon";

export function NotificationsWatchMenuStart({
  data,
  handleSelection,
  closeDropdown,
}) {
  const selected: { [x: string]: boolean } = { [data.status]: true };
  const majorText = "Receive notifications of revisions to this article.";

  return (
    <>
      <div>
        <button onClick={closeDropdown} className="header mobile-only">
          <span className="header-inner">
            <Icon name="chevron" />
            Notifications
          </span>
        </button>
        <h2 className="header desktop-only">Notifications</h2>
      </div>

      <WatchMenuItem
        value="major"
        label={selected.major ? "Watching page" : "Watch page"}
        text={majorText}
        checked={selected.major}
        onClickHandler={() => {
          handleSelection();
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
