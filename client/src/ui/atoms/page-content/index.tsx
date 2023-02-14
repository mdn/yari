import React from "react";

import "./index.scss";

// What we use on the document pages
export function MainContentContainer({
  children,
  className = "",
  standalone = false,
}: {
  children: React.ReactNode;
  className?: string;
  standalone?: boolean;
}) {
  return (
    <main
      // This exists for the benefit of a11y navigation which
      // uses anchor links to focus in on the content.
      id="content"
      className={`main-content ${className} ${standalone ? "standalone" : ""}`}
    >
      {children}
    </main>
  );
}
