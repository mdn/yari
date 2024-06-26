import { ReactNode } from "react";
import { DocParent } from "../../../libs/types/document";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { TopNavigation } from "../ui/organisms/top-navigation";
import { DEFAULT_LOCALE } from "../../../libs/constants";
import { OBSERVATORY_TITLE } from "../../../libs/constants";

export function ObservatoryLayout({
  parents = [],
  children,
}: {
  parents?: DocParent[];
  children: ReactNode;
}) {
  return (
    <>
      <div className="sticky-header-container">
        <TopNavigation />
        <ArticleActionsContainer
          parents={[
            {
              title: OBSERVATORY_TITLE,
              uri: `/${DEFAULT_LOCALE}/observatory`,
            },
            ...parents,
          ].filter(Boolean)}
          withSidebar={false}
        />
      </div>
      {children}
    </>
  );
}
