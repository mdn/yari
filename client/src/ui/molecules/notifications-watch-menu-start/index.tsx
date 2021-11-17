import { Button } from "../../atoms/button";

export function NotificationsWatchMenuStart({ setStepHandler }) {
  return (
    <form action={""} method="POST">
      <div className="watch-submenu-header">Notifications</div>

      <button
        role="menuitemradio"
        aria-checked="false"
        className="watch-menu-button"
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status">✅</span>

          <span className="watch-menu-button-label">Major updates</span>
          <span className="watch-menu-button-text">
            Only receive notifications of major browser compatability releases
            and revisions to this article.
          </span>
        </span>
      </button>

      {/*
        !!!
      */}
      <button
        type="button"
        role="menuitemradio"
        aria-checked="true"
        aria-haspopup="true"
        className="watch-menu-button"
        onClick={setStepHandler}
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status"></span>

          <span className="watch-menu-button-label">Custom</span>
          <span className="watch-menu-button-text">
            Select which events you would like to be notified of.
          </span>
        </span>
      </button>

      <button
        type="submit"
        role="menuitemradio"
        aria-checked="false"
        className="watch-menu-button"
      >
        <span className="watch-menu-button-wrap">
          <span className="watch-menu-button-status"></span>

          <span className="watch-menu-button-label">Unwatch</span>
          <span className="watch-menu-button-text">
            Stop receiveing notifications about this article.
          </span>
        </span>
      </button>
    </form>
  );
}
