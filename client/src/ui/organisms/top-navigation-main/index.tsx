import * as React from "react";

import { AuthContainer } from "../../molecules/auth-container";
import MainMenu from "../../molecules/main-menu";
import { HeaderNotificationsMenu } from "../../molecules/header-notifications-menu";
import { IconButton } from "../../atoms/icon-button";
import { UserMenu } from "../../molecules/user-menu";
import { Search } from "../../molecules/search";

import { useUserData } from "../../../user-context";

import "./index.scss";

export const TopNavigationMain = ({ showMainMenu }) => {
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;
  const [isMobile, setIsMobile] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  function updateViewportState(state) {
    setIsMobile(state.matches);
  }

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(max-width: 768px)");

      // add an event listener to report as the viewport changes
      mql.addEventListener("change", updateViewportState);

      // immediately report our initial state
      updateViewportState(mql);
    }
  }, []);

  return (
    <div
      className={`top-navigation-main ${
        isMobile && showMainMenu ? "show-grid" : ""
      }`}
    >
      <MainMenu />
      <div className="top-navigation-actions">
        {isMobile || showSearch ? (
          <Search
            onCloseSearch={() => {
              setShowSearch(false);
            }}
          />
        ) : (
          <IconButton
            clickHandler={() => {
              setShowSearch(true);
            }}
            extraClasses="toggle-search-button"
          >
            <span className="visually-hidden">Show search</span>
          </IconButton>
        )}
        {isSubscriber && (!showSearch || isMobile) && (
          <>
            <HeaderNotificationsMenu />
            <UserMenu />
          </>
        )}
        {!isSubscriber && (!showSearch || isMobile) && <AuthContainer />}
      </div>
    </div>
  );
};
