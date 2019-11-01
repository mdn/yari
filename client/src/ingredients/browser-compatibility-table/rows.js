import React from "react";
import { BrowserSupportDetail } from "./browser-support-detail";
import { BrowserSupportNotes } from "./browser-support-notes";

function buildCompatibilityObject(query, compatibilityData) {
  const features = {};

  if (!!compatibilityData.__compat) {
    const name = query.split(".").pop();
    features[name] = compatibilityData.__compat;
  }
  for (const compat in compatibilityData) {
    if (compat !== "__compat" && !!compatibilityData[compat]["__compat"]) {
      features[compat] = compatibilityData[compat]["__compat"];
    }
  }

  return features;
}

function getVersionAdded(support) {
  // When version compatibility is "unknown", it will be `undefined`.
  // In that case, return `null` so we render the "?" block.
  if (support === undefined) {
    return null;
  }

  if (Array.isArray(support)) {
    return support[0].version_added;
  }

  return support.version_added;
}

function getIndexNoteForBrowserDetail(indexNotes, browserDetailIndex) {
  return indexNotes.find(indexNotes => indexNotes.index === browserDetailIndex);
}

function computeDistinctKey(detail) {
  return `${detail.browser}:${detail.version_added}`;
}

function RenderBrowserSupportDetails({
  browserSupportDetails,
  rowIndex,
  indexNotes,
  currentNoteId,
  onNotesClick
}) {
  return browserSupportDetails.map((browserSupportDetail, detailIndex) => (
    <BrowserSupportDetail
      key={computeDistinctKey(browserSupportDetail)}
      index={`${rowIndex}-${detailIndex}`}
      browser={browserSupportDetail.browser}
      support={browserSupportDetail.support}
      versionAdded={browserSupportDetail.version_added}
      currentNoteId={currentNoteId}
      onNotesClick={onNotesClick}
      indexNote={getIndexNoteForBrowserDetail(
        indexNotes,
        `${rowIndex}-${detailIndex}`
      )}
    />
  ));
}

function buildIndexNotes(
  browserSupportDetails,
  rowIndex,
  currentNoteId,
  hasFlag,
  hasPrefix,
  hasAlternative,
  hasNotes
) {
  const indexNotes = browserSupportDetails.map(
    (browserSupportDetail, detailIndex) => {
      const support = browserSupportDetail.support;

      if (Array.isArray(support)) {
        const [notes, flags, prefixes, alternatives] = [[], [], [], []];

        for (const supportItem of support) {
          if (!!supportItem.alternative_name) {
            hasAlternative = true;
            alternatives.push(supportItem);
          } else if (!!supportItem.prefix) {
            hasPrefix = true;
            prefixes.push(supportItem);
          } else if (Array.isArray(supportItem.flags)) {
            hasFlag = true;
            flags.concat(supportItem.flags);
          } else if (!!supportItem.notes) {
            hasNotes = true;
            if (Array.isArray(supportItem.notes)) {
              notes.concat(supportItem.notes);
            } else {
              notes.push(supportItem.notes);
            }
          }
        }

        return {
          index: `${rowIndex}-${detailIndex}`,
          browser: browserSupportDetail.browser,
          version_added: browserSupportDetail.version_added,
          support,
          prefixes,
          alternatives,
          flags,
          notes
        };
      } else {
        if (!hasFlag) {
          hasFlag = !!(support && support.flags);
        }
        if (!hasPrefix) {
          hasPrefix = !!(support && support.prefix);
        }
        if (!hasNotes) {
          hasNotes = !!(support && support.notes);
        }

        const prefixes = !!(support && support.prefix) ? [support] : [];
        const alternatives = !!(support && support.alternative_name)
          ? [support]
          : [];
        const flags = !!(support && support.flags) ? support.flags : [];
        const notes = gatherNotesForIndexNote(support);

        return {
          index: `${rowIndex}-${detailIndex}`,
          browser: browserSupportDetail.browser,
          version_added: browserSupportDetail.version_added,
          support,
          prefixes,
          alternatives,
          flags,
          notes
        };
      }
    }
  );

  const filteredIndexNotes = indexNotes.filter(
    indexNotes => `bc-history-${indexNotes.index}` === currentNoteId
  );

  return [filteredIndexNotes, hasFlag, hasPrefix, hasAlternative, hasNotes];
}

// Find notes inside a support object and return as an array
function gatherNotesForIndexNote(currentSupport) {
  if (!currentSupport) {
    return [];
  }

  if (Array.isArray(currentSupport.notes)) {
    return currentSupport.notes;
  }

  return !!currentSupport.notes ? [currentSupport.notes] : [];
}

export function Rows({
  compatibilityData,
  displayBrowsers,
  onNotesClick,
  currentNoteId,
  setLegendIcons
}) {
  let [
    hasDeprecation,
    hasExperimental,
    hasNonStandard,
    hasFlag,
    hasPrefix,
    hasAlternative,
    hasNotes
  ] = [false, false, false, false, false, false, false];
  let indexNotes;
  const compatibility = buildCompatibilityObject(
    compatibilityData.query,
    compatibilityData.data
  );
  const browserCompatibilityRows = [];

  for (const key in compatibility) {
    const currentRow = compatibility[key];

    if (currentRow.status) {
      if (!hasDeprecation) {
        hasDeprecation = !!currentRow.status.deprecated;
      }
      if (!hasExperimental) {
        hasExperimental = !!currentRow.status.experimental;
      }
      if (!hasNonStandard) {
        hasNonStandard = !!currentRow.status.standard_track;
      }
    }

    const browserSupportDetails = displayBrowsers.map(browser => {
      const support = currentRow.support[browser];
      const version_added = getVersionAdded(support);
      return { browser, support, version_added };
    });

    [
      indexNotes,
      hasFlag,
      hasPrefix,
      hasAlternative,
      hasNotes
    ] = buildIndexNotes(
      browserSupportDetails,
      key,
      currentNoteId,
      hasFlag,
      hasPrefix,
      hasAlternative,
      hasNotes
    );

    browserCompatibilityRows.push([
      <tr key={key}>
        <th scope="row">
          <code>{key}</code>
          {currentRow.status && (
            <div className="bc-icons">
              {currentRow.status.deprecated && (
                <abbr
                  className="only-icon"
                  title="Deprecated. Not for use in new websites."
                >
                  <span>Deprecated</span>
                  <i className="ic-deprecated" />
                </abbr>
              )}
              {!currentRow.status.standard_track && (
                <abbr
                  className="only-icon"
                  title="Non-standard. Expect poor cross-browser support."
                >
                  <span>Non-standard</span>
                  <i className="ic-non-standard" />
                </abbr>
              )}
              {currentRow.status.experimental && (
                <abbr
                  className="only-icon"
                  title="Experimental. Expect behavior to change in the future."
                >
                  <span>Experimental</span>
                  <i className="ic-experimental" />
                </abbr>
              )}
            </div>
          )}
        </th>
        <RenderBrowserSupportDetails
          browserSupportDetails={browserSupportDetails}
          rowIndex={key}
          indexNotes={indexNotes}
          currentNoteId={currentNoteId}
          onNotesClick={onNotesClick}
        />
      </tr>,
      ...indexNotes.map(indexNote => (
        <tr
          key={`notes-${indexNote.index}`}
          id={`bc-history-${indexNote.index}`}
          className="bc-history"
          aria-hidden="false"
        >
          <th scope="row" />
          <td colSpan={browserSupportDetails.length}>
            <dl>
              <BrowserSupportNotes
                key={`notes-detail-${indexNote.index}`}
                indexNote={indexNote}
                blockElementTag="dt"
                noteElementTag="dd"
              />
            </dl>
          </td>
        </tr>
      ))
    ]);
  }
  setLegendIcons(
    hasDeprecation,
    hasExperimental,
    hasNonStandard,
    hasFlag,
    hasPrefix,
    hasAlternative,
    hasNotes
  );
  return browserCompatibilityRows;
}
