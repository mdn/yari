import * as React from "react";

// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../molecules/breadcrumbs'. ... Remove this comment to see the full error message
import { Breadcrumbs } from "../../molecules/breadcrumbs";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../article-actions'. Did you m... Remove this comment to see the full error message
import { ArticleActions } from "../article-actions";
// @ts-expect-error ts-migrate(2792) FIXME: Cannot find module '../../atoms/button'. Did you m... Remove this comment to see the full error message
import { Button } from "../../atoms/button";

import { Doc } from "../../../document/types";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";

export const ArticleActionsContainer = ({ doc }: { doc: Doc }) => {
  const [showArticleActionsMenu, setShowArticleActionsMenu] =
    React.useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();

  return (
    <div className="article-actions-container">
      <div className="container">
        <Button
          extraClasses="sidebar-button"
          icon="sidebar"
          type="action"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
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
