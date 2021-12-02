import * as React from "react";

import { Breadcrumbs } from "../../molecules/breadcrumbs";
import { Button } from "../../atoms/button";
import { ArticleActions } from "../article-actions";

import { Doc } from "../../../document/types";

import "./index.scss";

export const ArticleActionsContainer = ({ doc }: { doc: Doc }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [showArticleActionsMenu, setShowArticleActionsMenu] =
    React.useState(false);

  function toggleArticleActionsMenu(event) {
    const articleActionsMenuButton = event.target;

    if (articleActionsMenuButton) {
      articleActionsMenuButton.classList.toggle("icon-cancel");
      setShowArticleActionsMenu(!showArticleActionsMenu);
    }
  }

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
    <div className="article-actions-container">
      {/* if we have breadcrumbsfor the current page, continue rendering the section */}
      {doc.parents && <Breadcrumbs parents={doc.parents} />}
      {isMobile && (
        <Button
          type="action"
          ariaHasPopup={"menu"}
          icon="ellipses"
          onClickHandler={toggleArticleActionsMenu}
        >
          <span className="visually-hidden">Show article actions menu</span>
        </Button>
      )}
      <ArticleActions
        doc={doc}
        showArticleActionsMenu={showArticleActionsMenu}
        setShowArticleActionsMenu={setShowArticleActionsMenu}
      />
    </div>
  );
};
