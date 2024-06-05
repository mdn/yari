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
import { TOP_NAV_LOGIN, TOP_NAV_SIGNUP } from "../../../telemetry/constants";

export const TopNavigationMain = () => {
  const userData = useUserData();
  const isServer = useIsServer();

  return (
    <>
      <MainMenu />

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
    </>
  );
};
