import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { TopNavigation } from "../ui/organisms/top-navigation";
import { CurriculumDoc } from "../../../libs/types/curriculum";
import { PLACEMENT_ENABLED } from "../env";
import { useDocTitle } from "./utils";
import { SidebarContainer } from "../document/organisms/sidebar";
import { Sidebar } from "./sidebar";
import { TOC } from "../document/organisms/toc";
import { SidePlacement } from "../ui/organisms/placement";
import { ReactNode } from "react";

import "./index.scss";

export function CurriculumLayout({
  doc,
  withSidebar = true,
  extraClasses = [],
  children,
}: {
  doc?: CurriculumDoc;
  withSidebar?: boolean;
  extraClasses?: string[];
  children: ReactNode;
}) {
  useDocTitle(doc);
  return (
    doc && (
      <>
        <div className="sticky-header-container">
          <TopNavigation />
          <ArticleActionsContainer
            doc={doc}
            withSidebar={withSidebar && Boolean(doc.sidebar)}
          />
        </div>
        <main
          className={[
            "curriculum-content-container",
            "container",
            ...(withSidebar ? ["with-sidebar", "main-wrapper"] : []),
            ...extraClasses,
          ].join(" ")}
        >
          {withSidebar && doc.sidebar && (
            <div className="sidebar-container">
              <SidebarContainer
                doc={doc}
                label="Related Topics"
                tocTitle="In this module"
              >
                <Sidebar current={doc.mdn_url} sidebar={doc.sidebar} />
              </SidebarContainer>
              <div className="toc-container">
                <aside className="toc">
                  <nav>
                    {doc.toc && !!doc.toc.length && (
                      <TOC toc={doc.toc} title="In this module" />
                    )}
                  </nav>
                </aside>
                {PLACEMENT_ENABLED && <SidePlacement />}
              </div>
            </div>
          )}
          <article className="curriculum-content" lang={doc?.locale}>
            {children}
          </article>
        </main>
      </>
    )
  );
}
