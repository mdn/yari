import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";
import { ENABLE_PLUS } from "../../../constants";
import { isPlusAvailable } from "../../../utils";
import { ThemeSwitcher } from "../../molecules/theme-switcher";

export const TopNavigationMain = ({ isOpenOnMobile }) => {
  const userData = useUserData();
  const plusAvailable = isPlusAvailable(userData);
  const [showSearch, setShowSearch] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState<boolean | undefined>(false);

  function handleShowSearch() {
    setShowSearch(true);
    setHasOpened(true);
  }

  return (
    <div className="top-navigation-main">
      <MainMenu isOpenOnMobile={isOpenOnMobile} />

      <Search id="top-nav-search" />
      <ThemeSwitcher />

      {(ENABLE_PLUS && userData && userData.isAuthenticated && (
        <>
          <UserMenu />
        </>
      )) ||
        (plusAvailable && <AuthContainer />) || <></>}
    </div>
  );
};
