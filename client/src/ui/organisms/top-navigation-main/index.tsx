import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { Search } from "../../molecules/search";

import { useIsServer } from "../../../hooks";
import { useUserData } from "../../../user-context";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../env";
import { ThemeSwitcher } from "../../molecules/theme-switcher";
import Maintenance from "../../molecules/maintenance";
import { TOP_NAV_LOGIN, TOP_NAV_SIGNUP } from "../../../telemetry/constants";
import React from "react";

const UserMenu = React.lazy(() => import("../../molecules/user-menu"));

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
        userData.isAuthenticated && <UserMenu />) ||
        (userData?.maintenance && <Maintenance />) || (
          <AuthContainer
            logInGleanContext={TOP_NAV_LOGIN}
            signUpGleanContext={TOP_NAV_SIGNUP}
          />
        )}
    </div>
  );
};
