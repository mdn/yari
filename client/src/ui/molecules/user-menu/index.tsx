import React, { useState } from "react";

import { Avatar } from "../../atoms/avatar";
import { Button } from "../../atoms/button";
import { Submenu } from "../submenu";
import SignOut from "../../atoms/signout";

import { useUserData } from "../../../user-context";
import {
  FXA_SETTINGS_URL,
  MDN_APP_ANDROID,
  MDN_APP_DESKTOP,
  MDN_APP_IOS,
} from "../../../constants";

import "./index.scss";
import { DropdownMenu, DropdownMenuWrapper } from "../dropdown";

export const UserMenu = () => {
  const userData = useUserData();
  const [isOpen, setIsOpen] = useState<boolean>(false);

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

  const itemsCount = userMenuItems.items.length;
  if (MDN_APP_DESKTOP || MDN_APP_IOS) {
    userMenuItems.items.splice(itemsCount - 1, 0, {
      url: "/en-US/app-settings",
      label: "App settings",
    });
  }

  if (MDN_APP_ANDROID) {
    userMenuItems.items.splice(itemsCount - 1, 0, {
      component: () => (
        <Button onClickHandler={async () => window.Android.settings()}>
          App settings
        </Button>
      ),
      extraClasses: "",
    });
  }

  return (
    <DropdownMenuWrapper
      className="top-level-entry-container user-menu"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <Button
        type="action"
        id={`${userMenuItems.id}-button`}
        extraClasses="top-level-entry menu-toggle user-menu-toggle "
        ariaHasPopup="menu"
        ariaExpanded={isOpen || undefined}
        onClickHandler={(event) => {
          setIsOpen(!isOpen);
        }}
      >
        <Avatar userData={userData} />
        <span className="user-menu-id">{userData.email}</span>
      </Button>

      <DropdownMenu>
        <Submenu menuEntry={userMenuItems} />
      </DropdownMenu>
    </DropdownMenuWrapper>
  );
};
