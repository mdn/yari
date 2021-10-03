import React from "react";

// What we use on the document pages
export function MainContentContainer({
  children,
  className = "main-content",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      // This exists for the benefit of a11y navigation which
      // uses anchor links to focus in on the content.
      id="content"
      className={className}
      role="main"
    >
      {children}
    </main>
  );
}

// What we use on almost all pages
export function PageContentContainer({
  children,
  extraClasses,
}: {
  children: React.ReactNode;
  extraClasses?: string;
}) {
  return (
    <MainContentContainer
      className={`page-content-container ${extraClasses ? extraClasses : ""}`}
    >
      {children}
    </MainContentContainer>
  );
}
