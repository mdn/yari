import * as React from "react";

import { Breadcrumbs } from "../../molecules/breadcrumbs";
import { Button } from "../../atoms/button";
import { ArticleActions } from "../article-actions";

import { Doc } from "../../../document/types";

import "./index.scss";

export const ArticleActionsContainer = ({ doc }: { doc: Doc }) => {
  const [showArticleActionsMenu, setShowArticleActionsMenu] =
    React.useState(false);

  function toggleArticleActionsMenu(event) {
    const articleActionsMenuButton = event.target;

    if (articleActionsMenuButton) {
      articleActionsMenuButton.classList.toggle("icon-cancel");
      setShowArticleActionsMenu(!showArticleActionsMenu);
    }
  }

  return (
    <div className="article-actions-container">
      {/* if we have breadcrumbsfor the current page, continue rendering the section */}
      {doc.parents && <Breadcrumbs parents={doc.parents} />}

      <Button
        type="action"
        ariaHasPopup={"menu"}
        icon="ellipses"
        onClickHandler={toggleArticleActionsMenu}
        extraClasses="article-actions-toggle"
      >
        <span className="visually-hidden">Show article actions menu</span>
      </Button>
      <ArticleActions
        doc={doc}
        showArticleActionsMenu={showArticleActionsMenu}
        setShowArticleActionsMenu={setShowArticleActionsMenu}
      />
    </div>
  );
};
