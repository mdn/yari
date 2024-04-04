import { useLocation } from "react-router-dom";

import { useGleanClick } from "../../../telemetry/glean-context";

import "./index.scss";
import { A11Y_MENU } from "../../../telemetry/constants";

export function A11yNav() {
  const gleanClick = useGleanClick();
  const { pathname } = useLocation();
  const showLangMenuSkiplink = pathname.includes("/docs/");

  /**
   * Send a signal to GA when there is an interaction on one
   * of the access menu links.
   * @param {Object} event - The event object that was fired
   */
  function sendAccessMenuItemClick(event) {
    const action = new URL(event.target.href).hash;

    gleanClick(`${A11Y_MENU}: click ${action}`);
  }

  return (
    <ul id="nav-access" className="a11y-nav">
      <li>
        <a
          id="skip-main"
          href="#content"
          onClick={sendAccessMenuItemClick}
          onContextMenu={sendAccessMenuItemClick}
        >
          Skip to main content
        </a>
      </li>

      <li>
        <a
          id="skip-search"
          href="#top-nav-search-input"
          onClick={sendAccessMenuItemClick}
          onContextMenu={sendAccessMenuItemClick}
        >
          Skip to search
        </a>
      </li>
      {showLangMenuSkiplink && (
        <li>
          <a
            id="skip-select-language"
            href="#languages-switcher-button"
            onClick={sendAccessMenuItemClick}
            onContextMenu={sendAccessMenuItemClick}
          >
            Skip to select language
          </a>
        </li>
      )}
    </ul>
  );
}
