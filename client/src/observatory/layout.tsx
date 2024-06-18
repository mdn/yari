import { ReactNode } from "react";
import { DocParent } from "../../../libs/types/document";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { TopNavigation } from "../ui/organisms/top-navigation";

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
              title: "HTTP Observatory",
              uri: "/en-US/observatory",
            },
            ...parents,
          ].filter(Boolean)}
        />
      </div>
      {children}
    </>
  );
}
