import * as React from "react";

import NoteCard from "../../../ui/molecules/notecards";

export function NoteBanner({
  url,
  type,
  children,
}: {
  url: string;
  type: "neutral" | "warning";
  children: React.ReactNode;
}) {
  return (
    <NoteCard extraClasses={`localized-content-note ${type || ""}`}>
      <p>
        <a href={url} className={!url.startsWith("/") ? "external" : undefined}>
          {children}
        </a>
      </p>
    </NoteCard>
  );
}
