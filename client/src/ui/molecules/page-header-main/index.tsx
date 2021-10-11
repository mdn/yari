import * as React from "react";

import { AuthContainer } from "../auth-container";
import MainMenu from "../main-menu";
import { HeaderNotificationsMenu } from "../header-notifications-menu";
import ToggleSeachButton from "../../atoms/toggle-search-button";
import { UserMenu } from "../user-menu";
import { Search } from "../search";

import { useUserData } from "../../../user-context";

import "./index.scss";

export const PageHeaderMain = ({ showMainMenu }) => {
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;
  const [isMobile, setIsMobile] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  function updateViewportState(state) {
    setIsMobile(state.matches);
  }

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(max-width: 74.9375em)");

      // add an event listener to report as the viewport changes
      mql.addEventListener("change", updateViewportState);

      // immediately report our initial state
      updateViewportState(mql);
    }
  }, []);

  return (
    <div
      className={`page-header-main ${
        isMobile && showMainMenu ? "show-grid" : ""
      }`}
    >
      <MainMenu />
      {isMobile || showSearch ? (
        <Search
          onCloseSearch={() => {
            setShowSearch(false);
          }}
        />
      ) : (
        <ToggleSeachButton
          onClick={() => {
            setShowSearch(true);
          }}
        />
      )}
      {isSubscriber && (!showSearch || isMobile) && (
        <>
          <HeaderNotificationsMenu />
          <UserMenu />
        </>
      )}
      {!isSubscriber && (!showSearch || isMobile) && <AuthContainer />}
    </div>
  );
};
