import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useIsServer } from "../../../hooks";
import { useUserData } from "../../../user-context";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../env";
import { ThemeSwitcher } from "../../molecules/theme-switcher";
import Maintenance from "../../molecules/maintenance";

export const TopNavigationMain = ({ isOpenOnMobile }) => {
  const userData = useUserData();
  const isServer = useIsServer();

  return (
    <div className="top-navigation-main">
      <MainMenu isOpenOnMobile={isOpenOnMobile} />

      <Search id="top-nav-search" />
      <ThemeSwitcher />

      {(PLUS_IS_ENABLED &&
        !isServer &&
        userData &&
        userData.isAuthenticated && (
          <>
            <UserMenu />
          </>
        )) ||
        (userData?.maintenance && <Maintenance />) || <AuthContainer />}
    </div>
  );
};
