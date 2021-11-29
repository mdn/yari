import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { HeaderNotificationsMenu } from "../../molecules/header-notifications-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";

export const TopNavigationMain = () => {
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;

  return (
    <div className="top-navigation-main">
      <MainMenu />
      <div className="top-navigation-actions">
        <Search />

        {isSubscriber && (
          <>
            <HeaderNotificationsMenu />
            <UserMenu />
          </>
        )}
        {!isSubscriber && <AuthContainer />}
      </div>
    </div>
  );
};
