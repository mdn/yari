import { Button } from "../../atoms/button";

import "./index.scss";

const WatchMenu = () => {
  return (
    <>
      <Button
        ariaHasPopup={"menu"}
        extraClasses="ghost watch-button"
        id="WatchMenu-button"
        aria-label="Watch this page for updates"
      >
        Watch
      </Button>

      <form className="watch-menu">
        <button
          type="submit"
          role="menuitemradio"
          aria-checked="false"
          className="watch-menu-button"
        >
          <span className="watch-menu-button-wrap">
            <span className="watch-menu-button-status">✅</span>

            <span className="watch-menu-button-label">Major updates</span>
            <span className="wathc-menu-button-text">
              Only receive notifications of major browser compatability releases
              and revisions to this article.
            </span>
          </span>
        </button>

        <button
          type="submit"
          role="menuitemradio"
          aria-checked="true"
          aria-haspopup="true"
          className="watch-menu-button"
        >
          <span className="watch-menu-button-wrap">
            <span className="watch-menu-button-status"></span>

            <span className="watch-menu-button-label">Custom</span>
            <span className="wathc-menu-button-text">
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
            <span className="wathc-menu-button-text">
              Stop receiveing notifications about this article.
            </span>
          </span>
        </button>
      </form>
    </>
  );
};

export default WatchMenu;
