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
  const isSubscriber = userData && userData.isSubscriber;
  const [showSearch, setShowSearch] = React.useState(false);

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
        onClickHandler={() => {
          setShowSearch(true);
        }}
        extraClasses="toggle-search-button"
      >
        <span className="visually-hidden">Show search</span>
      </Button>

      {isSubscriber && (
        <>
          <HeaderNotificationsMenu />
          <UserMenu />
        </>
      )}
      {!isSubscriber && <AuthContainer />}
    </div>
  );
};
