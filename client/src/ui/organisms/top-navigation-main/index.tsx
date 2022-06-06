import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../env";
import { isPlusAvailable } from "../../../utils";
import { ThemeSwitcher } from "../../molecules/theme-switcher";

export const TopNavigationMain = ({ isOpenOnMobile }) => {
  const userData = useUserData();
  const plusAvailable = isPlusAvailable(userData);

  return (
    <div className="top-navigation-main">
      <MainMenu isOpenOnMobile={isOpenOnMobile} />

      <Search id="top-nav-search" />
      <ThemeSwitcher />

      {(PLUS_IS_ENABLED && userData && userData.isAuthenticated && (
        <>
          <UserMenu />
        </>
      )) ||
        (plusAvailable && <AuthContainer />) || <></>}
    </div>
  );
};
