import React from "react";

import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import SignOut from "../../atoms/signout";

import { useUserData } from "../../../user-context";
import { FXA_SETTINGS_URL } from "../../../constants";

import "./index.scss";

export const UserMenu = () => {
  const userData = useUserData();
  const previousActiveElement = React.useRef<null | HTMLButtonElement>(null);
  const [visibleSubMenuId, setVisibleSubMenuId] = React.useState<string | null>(
    null
  );

  // if we don't have the user data yet, don't render anything
  if (!userData || typeof window === "undefined") {
    return null;
  }

  const userMenuItems = {
    label: "My MDN Plus",
    id: "my-mdn-plus",
    items: [
      {
        label: userData.email || "",
        extraClasses: "submenu-header",
      },
      {
        url: FXA_SETTINGS_URL,
        label: "Manage account",
      },
      {
        url: "https://accounts.stage.mozaws.net/subscriptions/",
        label: "Manage subscription",
      },
      {
        url: "https://support.mozilla.org/",
        label: "Help",
      },
      {
        component: SignOut,
        extraClasses: "signout-container",
      },
    ],
  };

  function hideSubMenuIfVisible() {
    if (visibleSubMenuId) {
      setVisibleSubMenuId(null);
    }
  }

  /**
   * Show and hide submenus in the main menu, send GA events and updates
   * the ARIA state.
   * @param {Object} event - The event that triggered the function.
   * @param {String} menuEntryId - The current top-level menu item id
   */
  function toggleSubMenu(event, menuEntryId) {
    // store the current activeElement
    previousActiveElement.current = document.activeElement as HTMLButtonElement;
    setVisibleSubMenuId(visibleSubMenuId === menuEntryId ? null : menuEntryId);
  }

  return (
    <div className="top-level-entry-container user-menu">
      <Button
        type="action"
        id={`${userMenuItems.id}-button`}
        extraClasses="top-level-entry menu-toggle user-menu-toggle "
        ariaHasPopup="menu"
        ariaExpanded={userMenuItems.id === visibleSubMenuId}
        onClickHandler={(event) => {
          toggleSubMenu(event, userMenuItems.id);
        }}
      >
        <Avatar userData={userData} />
        <span className="user-menu-id">{userData.email}</span>
      </Button>

      <Submenu
        menuEntry={userMenuItems}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </div>
  );
};
