import React from "react";

import { Button } from "../../atoms/button";
import { LanguageMenu } from "./language-menu";

import { useIsServer } from "../../../hooks";
import { useUserData } from "../../../user-context";

import { Doc, DocMetadata } from "../../../../../libs/types/document";

import "./index.scss";
import { Overlay, useUIStatus } from "../../../ui-context";
import { useEffect, useState } from "react";
import { KeyedMutator } from "swr";
import { Item } from "../../../plus/collections/api";

const BookmarkMenu = React.lazy(() => import("./bookmark-menu"));

export const ArticleActions = ({
  doc,
  showTranslations = true,
  item,
  scopedMutator,
}: {
  doc?: Doc | DocMetadata;
  showTranslations?: boolean;
  item?: Item;
  scopedMutator?: KeyedMutator<Item[][]>;
}) => {
  const [showArticleActionsMenu, setShowArticleActionsMenu] = useState(false);
  const userData = useUserData();
  const isServer = useIsServer();
  const { toggleMobileOverlay } = useUIStatus();
  const isAuthenticated = userData && userData.isAuthenticated;
  const translations = doc?.other_translations || [];
  const native = doc?.native;

  function toggleArticleActionsMenu() {
    setShowArticleActionsMenu(!showArticleActionsMenu);
  }

  useEffect(
    () => toggleMobileOverlay(Overlay.ArticleActions, showArticleActionsMenu),
    [showArticleActionsMenu, toggleMobileOverlay]
  );

  // @TODO we will need the following when including the language drop-down
  // const translations = doc.other_translations || [];

  return (
    (((translations && !!translations.length) ||
      (!isServer && isAuthenticated)) && (
      <>
        <div
          className={`article-actions${
            showArticleActionsMenu ? " show-actions" : ""
          }`}
        >
          <Button
            type="action"
            aria-label="Article actions"
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
              {!isServer && isAuthenticated && (
                <li className="article-actions-entry">
                  <BookmarkMenu
                    doc={doc}
                    item={item}
                    scopedMutator={scopedMutator}
                  />
                </li>
              )}
              {showTranslations &&
                translations &&
                !!translations.length &&
                native && (
                  <li className="article-actions-entry">
                    <LanguageMenu
                      onClose={() =>
                        showArticleActionsMenu && toggleArticleActionsMenu()
                      }
                      translations={translations}
                      native={native}
                    />
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
