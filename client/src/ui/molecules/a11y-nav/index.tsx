import * as React from "react";

import { useGA } from "../../../ga-context";

import "./index.scss";

export function A11yNav() {
  const ga = useGA();

  /**
   * Send a signal to GA when there is an interaction on one
   * of the access menu links.
   * @param {Object} event - The event object that was fired
   */
  function sendAccessMenuItemClick(event) {
    const action = new URL(event.target.href).hash;
    const label = event.target.textContent;

    ga("send", {
      hitType: "event",
      eventCategory: "Access Links",
      eventAction: action,
      eventLabel: label,
    });
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
          {"Skip to main content"}
        </a>
      </li>
      <li>
        <a
          id="skip-search"
          href="#main-q"
          onClick={sendAccessMenuItemClick}
          onContextMenu={sendAccessMenuItemClick}
        >
          {"Skip to search"}
        </a>
      </li>
    </ul>
  );
}
