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
      // This is added to ensure that the main element is
      // focusable. https://github.com/mdn/yari/issues/2755
      // TypeScript expects this value to be a number
      tabIndex={-1}
    >
      {children}
    </main>
  );
}

// What we use on almost all pages
export function PageContentContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainContentContainer className="page-content-container">
      {children}
    </MainContentContainer>
  );
}
