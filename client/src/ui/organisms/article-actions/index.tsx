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
  const userData = useUserData();
  const isSubscriber = userData && userData.isSubscriber;

  function toggleArticleActionsMenu(event) {
    setShowArticleActionsMenu(!showArticleActionsMenu);
  }

  // @TODO we will need the following when including the language drop-down
  // const translations = doc.other_translations || [];

  return (
    <>
      {isSubscriber && (
        <div
          className={`article-actions${
            showArticleActionsMenu ? " show-actions" : ""
          }`}
        >
          <Button
            type="action"
            extraClasses="article-actions-toggle"
            onClickHandler={toggleArticleActionsMenu}
            icon={showArticleActionsMenu ? "cancel" : "ellipses"}
          >
            <span className="article-actions-dialog-heading">
              Article Actions
            </span>
          </Button>
          <ul className="article-actions-entries">
            <>
              <li className="article-actions-entry">
                <NotificationsWatchMenu doc={doc} />
              </li>
              <li className="article-actions-entry">
                <BookmarkToggle doc={doc} />
              </li>
              <li className="article-actions-entry">
                <ThemeSwitcher />
              </li>
            </>
          </ul>
        </div>
      )}
    </>
  );
};
