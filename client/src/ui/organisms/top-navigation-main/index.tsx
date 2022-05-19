import * as React from "react";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/auth-container... Remove this comment to see the full error message
import { AuthContainer } from "../../molecules/auth-container";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/main-menu'. Di... Remove this comment to see the full error message
import MainMenu from "../../molecules/main-menu";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/user-menu'. Di... Remove this comment to see the full error message
import { UserMenu } from "../../molecules/user-menu";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/search'. Did y... Remove this comment to see the full error message
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";
import { PLUS_IS_ENABLED } from "../../../constants";
import { isPlusAvailable } from "../../../utils";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/theme-switcher... Remove this comment to see the full error message
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
