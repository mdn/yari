import * as React from "react";

import NoteCard from "../../../ui/molecules/notecards";
import { NotecardType } from "../../../types/notecards";

export function NoteBanner({
  url,
  type,
  children,
}: {
  url: string;
  type: NotecardType;
  children: React.ReactNode;
}) {
  return (
    <NoteCard type={type} extraClasses="localized-content-note">
      <p>
        <a href={url} className={!url.startsWith("/") ? "external" : undefined}>
          {children}
        </a>
      </p>
    </NoteCard>
  );
}
