import * as React from "react";
import { VersionBlock } from "./version-block";

export const BrowserSupportNote: any = ({
  indexNote,
  versionAdded,
  versionRemoved,
  noteContent,
  noteType,
  blockElementTag,
  noteElementTag,
  displayBlock,
  displayNote,
}) => {
  const note: any[] = [];
  if (displayBlock) {
    note.push(
      <VersionBlock
        key="block"
        icon={noteType}
        browser={indexNote.browser}
        versionAdded={versionAdded}
        versionRemoved={versionRemoved}
        elementTag={blockElementTag}
      />
    );
  }
  if (displayNote) {
    note.push(
      React.createElement(
        noteElementTag,
        {
          key: `note-${indexNote.index}`,
          className: "padded-note",
        },
        noteContent
      )
    );
  } else {
    note.push(
      React.createElement(
        noteElementTag,
        {
          key: `note-${indexNote.index}`,
          className: "padded-note",
        },
        <span />
      )
    );
  }
  return note;
};
