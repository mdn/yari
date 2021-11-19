import * as React from "react";

import { BookmarkToggle } from "../../molecules/bookmark";
import { Button } from "../../atoms/button";
import { NotificationsWatchMenu } from "../../molecules/notifications-watch-menu";
import { ThemeSwitcher } from "../../molecules/theme-switcher";

import { useUserData } from "../../../user-context";

import { Doc } from "../../../document/types";

import "./index.scss";

export const ArticleActions = ({
  doc,
  showArticleActionsMenu,
  setShowArticleActionsMenu,
}: {
  doc: Doc;
  showArticleActionsMenu: boolean;
  setShowArticleActionsMenu: (show: boolean) => void;
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;

  function toggleArticleActionsMenu(event) {
    const pageOverlay = document.querySelector(".page-overlay");
    const articleActionsMenuButton = event.target;

    if (articleActionsMenuButton) {
      articleActionsMenuButton.classList.toggle("menu-close");
      setShowArticleActionsMenu(!showArticleActionsMenu);
    }

    if (pageOverlay) {
      pageOverlay.classList.toggle("hidden");
    }
  }

  function updateViewportState(state) {
    setIsMobile(state.matches);
  }

  // @TODO we will need the following when including the language drop-down
  // const translations = doc.other_translations || [];

  React.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(max-width: 63.9375em)");

      // add an event listener to report as the viewport changes
      mql.addEventListener("change", updateViewportState);

      // immediately report our initial state
      updateViewportState(mql);
    }
  }, []);

  return (
    <div
      className={`article-actions ${
        isMobile && showArticleActionsMenu ? "show-utilities" : ""
      }`}
    >
      {/* styling for icon is defined in client/src/ui/atoms/icon-button/index.scss */}
      {isMobile && (
        <Button onClickHandler={toggleArticleActionsMenu} icon="menu-close">
          <span className="article-actions-dialog-heading">
            Article actions
          </span>
        </Button>
      )}
      <ul className="article-actions-entries">
        {isSubscriber && (
          <>
            <li className="article-actions-entry">
              <BookmarkToggle doc={doc} />
            </li>
            <li className="article-actions-entry">
              <NotificationsWatchMenu doc={doc} />
            </li>
            <li className="article-actions-entry">
              <ThemeSwitcher />
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
