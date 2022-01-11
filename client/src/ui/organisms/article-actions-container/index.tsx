import * as React from "react";

import { Breadcrumbs } from "../../molecules/breadcrumbs";
import { ArticleActions } from "../article-actions";

import { Doc } from "../../../document/types";

import "./index.scss";

export const ArticleActionsContainer = ({ doc }: { doc: Doc }) => {
  const [showArticleActionsMenu, setShowArticleActionsMenu] =
    React.useState(false);

  return (
    <div className="article-actions-container">
      {/* if we have breadcrumbs for the current page, continue rendering the section */}
      <div className="container">
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
