import * as React from "react";

import { Breadcrumbs } from "../../molecules/breadcrumbs";
import { ArticleActions } from "../article-actions";
import { Button } from "../../atoms/button";

import { Doc, DocParent } from "../../../../../libs/types/document";

import { useUIStatus } from "../../../ui-context";

import "./index.scss";

export const ArticleActionsContainer = ({
  doc,
  parents = doc?.parents,
}: {
  doc?: Doc;
  parents?: DocParent[];
}) => {
  const { isSidebarOpen, setIsSidebarOpen } = useUIStatus();

  return (
    <div className="article-actions-container">
      <div className="container">
        <Button
          extraClasses="sidebar-button"
          icon="sidebar"
          type="action"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isSidebarOpen}
          aria-controls="sidebar-quicklinks"
          onClickHandler={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* if we have breadcrumbs for the current page, continue rendering the section */}
        {parents && <Breadcrumbs parents={parents} />}

        {doc && <ArticleActions doc={doc} />}
      </div>
    </div>
  );
};
