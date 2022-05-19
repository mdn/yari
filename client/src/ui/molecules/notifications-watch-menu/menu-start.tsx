import { WatchMenuItem } from "./atoms/menu-item";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/icon'. Did you mea... Remove this comment to see the full error message
import { Icon } from "../../atoms/icon";

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
        <button
          onClick={closeDropdown}
          className="watch-submenu-header mobile-only"
        >
          <span className="watch-submenu-header-wrap">
            <Icon name="chevron" />
            Notifications
          </span>
        </button>
        <h2 className="watch-submenu-header desktop-only">Notifications</h2>
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
