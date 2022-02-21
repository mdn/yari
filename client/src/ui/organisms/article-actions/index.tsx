import * as React from "react";

import { Button } from "../../atoms/button";
import { NotificationsWatchMenu } from "../../molecules/notifications-watch-menu";
import { ThemeSwitcher } from "../../molecules/theme-switcher";
import { LanguageMenu } from "../../molecules/language-menu";

import { useUserData } from "../../../user-context";

import { Doc } from "../../../document/types";

import "./index.scss";
import { MDN_APP } from "../../../constants";
import { useUIStatus } from "../../../ui-context";
import { BookmarkContainer } from "../../molecules/bookmark";

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
  const isAuthenticated = userData && userData.isAuthenticated;
  const { setIsSidebarOpen } = useUIStatus();
  const translations = doc.other_translations || [];
  const { native } = doc;

  function toggleArticleActionsMenu(event) {
    setShowArticleActionsMenu(!showArticleActionsMenu);
  }

  // @TODO we will need the following when including the language drop-down
  // const translations = doc.other_translations || [];

  return (
    (((!MDN_APP && translations && !!translations.length) ||
      isAuthenticated) && (
      <>
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
              {isAuthenticated && (
                <li className="article-actions-entry">
                  <NotificationsWatchMenu doc={doc} />
                </li>
              )}
              {isAuthenticated && (
                <li className="article-actions-entry">
                  <BookmarkContainer doc={doc} />
                </li>
              )}
              {isAuthenticated && (
                <li className="article-actions-entry">
                  <ThemeSwitcher />
                </li>
              )}
              {!MDN_APP && translations && !!translations.length && (
                <li className="article-actions-entry">
                  <LanguageMenu translations={translations} native={native} />
                </li>
              )}
            </>
          </ul>
        </div>
      </>
    )) ||
    null
  );
};
