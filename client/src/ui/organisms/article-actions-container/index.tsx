import * as React from "react";
import { useContext } from "react";

import { Breadcrumbs } from "../../molecules/breadcrumbs";
import { ArticleActions } from "../article-actions";
import { Button } from "../../atoms/button";

import { Doc } from "../../../document/types";

import UIContext from "../../../ui-context";

import "./index.scss";

export const ArticleActionsContainer = ({ doc }: { doc: Doc }) => {
  const [showArticleActionsMenu, setShowArticleActionsMenu] =
    React.useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useContext(UIContext);

  return (
    <div className="article-actions-container">
      <div className="container">
        <Button
          extraClasses="sidebar-button"
          icon="sidebar"
          type="action"
          onClickHandler={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
        />

        {/* if we have breadcrumbs for the current page, continue rendering the section */}
        {doc.parents && <Breadcrumbs parents={doc.parents} />}

        <ArticleActions
          doc={doc}
          showArticleActionsMenu={showArticleActionsMenu}
          setShowArticleActionsMenu={setShowArticleActionsMenu}
        />
      </div>
    </div>
  );
};
