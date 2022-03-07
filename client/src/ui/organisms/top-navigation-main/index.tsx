import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { HeaderNotificationsMenu } from "../../molecules/header-notifications-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";
import { ENABLE_PLUS } from "../../../constants";
import { ThemeToggle } from "../../molecules/theme-toggle";

export const TopNavigationMain = ({ isOpenOnMobile }) => {
  const userData = useUserData();
  const isAuthenticated = userData && userData.isAuthenticated;

  return (
    <div className="top-navigation-main">
      <MainMenu isOpenOnMobile={isOpenOnMobile} />

      <Search id="top-nav-search" />
      <ThemeToggle></ThemeToggle>

      {ENABLE_PLUS &&
        ((isAuthenticated && (
          <>
            <HeaderNotificationsMenu />
            <UserMenu />
          </>
        )) || <AuthContainer />)}
    </div>
  );
};
