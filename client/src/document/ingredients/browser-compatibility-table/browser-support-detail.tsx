import * as React from "react";
import { VersionBlock } from "./version-block";
import { BrowserSupportNotes } from "./browser-support-notes";

export function BrowserSupportDetail({
  index,
  browser,
  support,
  versionAdded,
  currentNoteId,
  onNotesClick,
  indexNote,
}) {
  let noteType;
  if (
    !support ||
    (!support.notes &&
      !support.flags &&
      !support.prefix &&
      !Array.isArray(support))
  ) {
    return (
      <VersionBlock
        browser={browser}
        versionAdded={versionAdded}
        elementTag="td"
      />
    );
  } else {
    if (support.prefix) {
      noteType = "prefix";
    } else if (support.notes) {
      noteType = "note";
    } else if (support.flags) {
      noteType = "flag";
    } else if (Array.isArray(support) && !!support[0].notes) {
      noteType = "note";
    }
  }

  return (
    <VersionBlock
      icon={noteType}
      browser={browser}
      versionAdded={versionAdded}
      elementTag="td"
      index={`bc-history-${index}`}
      onNotesClick={onNotesClick}
      currentNoteId={currentNoteId}
    >
      <button
        title="Open implementation notes"
        className={`bc-history-link only-icon ${
          currentNoteId === `bc-history-${index}`
            ? "bc-history-link-inverse"
            : null
        }`}
        tabIndex={0}
      >
        <span>Open</span>
        <i className="ic-history" aria-hidden="false" />
      </button>
      {indexNote && (
        <div className="bc-notes">
          <BrowserSupportNotes
            key={`${indexNote.index}`}
            indexNote={indexNote}
            blockElementTag="div"
            noteElementTag="div"
            noBlocks
          />
        </div>
      )}
    </VersionBlock>
  );
}
