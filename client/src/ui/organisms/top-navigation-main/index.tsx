import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { HeaderNotificationsMenu } from "../../molecules/header-notifications-menu";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { Button } from "../../atoms/button";

import { useUserData } from "../../../user-context";

import "./index.scss";

export const TopNavigationMain = () => {
  const userData = useUserData();
  const isAuthenticated = userData && userData.isAuthenticated;
  const [showSearch, setShowSearch] = React.useState(false);

  function handleShowSearch() {
    setShowSearch(true);
  }

  return (
    <div
      className={`top-navigation-main${showSearch ? " has-search-open" : ""}`}
    >
      <MainMenu />

      <Search
        onCloseSearch={() => {
          setShowSearch(false);
        }}
      />
      <Button
        type="action"
        icon="search"
        onClickHandler={handleShowSearch}
        extraClasses="toggle-search-button"
      >
        <span className="visually-hidden">Show search</span>
      </Button>

      {isAuthenticated && (
        <>
          <HeaderNotificationsMenu />
          <UserMenu />
        </>
      )}
      {!isAuthenticated && <AuthContainer />}
    </div>
  );
};
