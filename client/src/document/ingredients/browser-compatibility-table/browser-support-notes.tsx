import React from "react";
import { BrowserSupportNote } from "./browser-support-note";

function shouldDisplayBlock(blockDisplayed, versionAdded) {
  if (blockDisplayed) {
    return !!versionAdded;
  }

  return true;
}

function flagInfoForBrowser(browser) {
  switch (browser) {
    case "chrome":
    case "chrome_android":
      return "To change preferences in Chrome, visit chrome://flags.";
    case "firefox":
    case "firefox_android":
      return "To change preferences in Firefox, visit about:config.";
    default:
      return "";
  }
}

export const BrowserSupportNotes: any = ({
  indexNote,
  blockElementTag,
  noteElementTag,
  noBlocks,
}) => {
  let blockDisplayed = false;
  let browserSupportNotes: any = [];
  let currentNoteContent, currentNote;

  if (Array.isArray(indexNote.support) && indexNote.notes.length === 0) {
    browserSupportNotes.push(
      <BrowserSupportNote
        key={`note-empty-${indexNote.index}`}
        indexNote={indexNote}
        versionAdded={indexNote.support[0].version_added}
        noteContent={currentNoteContent}
        noteType="none"
        blockElementTag={blockElementTag}
        noteElementTag={noteElementTag}
        displayBlock={
          !noBlocks &&
          shouldDisplayBlock(blockDisplayed, indexNote.support[0].version_added)
        }
        displayNote={false}
      />
    );
    blockDisplayed = true;
  } else if (indexNote.notes.length > 0) {
    browserSupportNotes.push(
      indexNote.notes.map((note, index) => {
        currentNoteContent = (
          <>
            <abbr className="only-icon" title="See implementation notes">
              <span>Notes</span>
              <i className="ic-footnote"></i>
            </abbr>
            <span dangerouslySetInnerHTML={{ __html: note }}></span>
          </>
        );
        currentNote = (
          <BrowserSupportNote
            key={`note-${indexNote.index}-${index}`}
            indexNote={indexNote}
            versionAdded={indexNote.version_added}
            noteContent={currentNoteContent}
            noteType="note"
            blockElementTag={blockElementTag}
            noteElementTag={noteElementTag}
            displayBlock={
              !noBlocks &&
              shouldDisplayBlock(blockDisplayed, indexNote.version_added)
            }
            displayNote
          />
        );
        blockDisplayed = true;
        return currentNote;
      })
    );
    blockDisplayed = true;
  }

  if (indexNote.flags.length > 0) {
    browserSupportNotes.push(
      indexNote.flags.map((flag, index) => {
        currentNoteContent = (
          <>
            <abbr
              className="only-icon"
              title="User must explicitly enable this feature."
            >
              <span>Disabled</span>
              <i className="ic-disabled"></i>
            </abbr>{" "}
            From version {flag.version_added || indexNote.version_added}: this
            feature is behind the <code>{flag.name}</code> {flag.type}
            {!!flag.value_to_set &&
              ` (needs to be set to <code>${flag.value_to_set}</code>)`}
            . {flagInfoForBrowser(indexNote.browser)}
          </>
        );
        return (
          <BrowserSupportNote
            key={`flag-${indexNote.index}-${index}`}
            indexNote={indexNote}
            versionAdded={flag.version_added || indexNote.version_added}
            noteContent={currentNoteContent}
            noteType="flag"
            blockElementTag={blockElementTag}
            noteElementTag={noteElementTag}
            displayBlock={
              !noBlocks &&
              shouldDisplayBlock(blockDisplayed, flag.version_added)
            }
            displayNote
          />
        );
      })
    );
  }

  if (indexNote.alternatives.length > 0) {
    browserSupportNotes.push(
      indexNote.alternatives.map((alternative, index) => {
        currentNoteContent = (
          <>
            <abbr
              className="only-icon"
              title={`Uses the non-standard name: ${alternative.alternative_name}`}
            >
              <span>Alternate Name</span>
              <i className="ic-altname"></i>
            </abbr>{" "}
            Uses the non-standard name:{" "}
            <code>{alternative.alternative_name}</code>
          </>
        );
        return (
          <BrowserSupportNote
            key={`alternative-${indexNote.index}-${index}`}
            indexNote={indexNote}
            versionAdded={alternative.version_added}
            versionRemoved={alternative.version_removed}
            noteContent={currentNoteContent}
            noteType="alternative"
            blockElementTag={blockElementTag}
            noteElementTag={noteElementTag}
            displayBlock={
              !noBlocks &&
              shouldDisplayBlock(blockDisplayed, alternative.version_added)
            }
            displayNote
          />
        );
      })
    );
  }

  if (indexNote.prefixes.length > 0) {
    browserSupportNotes.push(
      indexNote.prefixes.map((prefix, index) => {
        currentNoteContent = (
          <>
            <abbr
              className="only-icon"
              title={`Implemented with the vendor prefix: ${prefix.prefix}`}
            >
              <span>Prefixed</span>
              <i className="ic-prefix"></i>
            </abbr>
            Implemented with the vendor prefix: {prefix.prefix}
          </>
        );
        return (
          <BrowserSupportNote
            key={`prefix-${indexNote.index}-${index}`}
            indexNote={indexNote}
            versionAdded={prefix.version_added}
            noteContent={currentNoteContent}
            noteType="prefix"
            blockElementTag={blockElementTag}
            noteElementTag={noteElementTag}
            displayBlock={!noBlocks}
            displayNote
          />
        );
      })
    );
  }

  return browserSupportNotes;
};
