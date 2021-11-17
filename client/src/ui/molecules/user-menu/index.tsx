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
        extraClasses: "usermenu-email-desktop show-desktop-inline-block",
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
    <div className="user-menu">
      <Button
        type="action"
        id={`${userMenuItems.id}-button`}
        extraClasses="user-menu-toggle with-icon-flex mobile-only"
        ariaHasPopup="menu"
        ariaExpanded={userMenuItems.id === visibleSubMenuId}
        onClickHandler={(event) => {
          toggleSubMenu(event, userMenuItems.id);
        }}
      >
        <Avatar userData={userData} />
        <span className="hide-desktop">{userData.email}</span>
      </Button>
      <Submenu
        menuEntry={userMenuItems}
        visibleSubMenuId={visibleSubMenuId}
        onBlurHandler={hideSubMenuIfVisible}
      />
    </div>
  );
};
