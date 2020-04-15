import * as React from "react";
import BrowserName from "./utils/browser-name";

export const VersionBlock: any = ({
  icon,
  browser,
  versionAdded,
  versionRemoved,
  elementTag,
  index,
  onNotesClick,
  currentNoteId,
  children,
}) => {
  let isSupported;
  let textContent;
  let bcSupport;
  let bcIcon;
  let bcIconTitle;
  let hasChildren = !!children;
  switch (versionAdded) {
    case true:
      isSupported = "yes";
      textContent = "Yes";
      bcSupport = "Full Support";
      break;
    case false:
      isSupported = "no";
      textContent = "No";
      bcSupport = "No Support";
      break;
    case null:
    case undefined:
      isSupported = "unknown";
      textContent = "?";
      bcSupport = "Compatibility unknown; please update this.";
      break;
    default:
      isSupported = "yes";
      textContent = `${versionAdded}`;
      bcSupport = "Full Support";
      break;
  }
  switch (icon) {
    case "note":
      bcIcon = "ic-footnote";
      bcIconTitle = "See implementation notes";
      break;
    case "flag":
      bcIcon = "ic-disabled";
      bcIconTitle = "User must explicitly enable this feature.";
      break;
    case "prefix":
      bcIcon = "ic-prefix";
      bcIconTitle = "Implemented with a vendor prefix";
      break;
    case "alternative":
      isSupported = "no";
      textContent = `${
        typeof versionAdded === "string" ? versionAdded : "?"
      } - ${versionRemoved}`;
      bcIcon = "ic-altname";
      bcIconTitle = "Uses a non-standard name";
      break;
    default:
      break;
  }
  return React.createElement(
    `${elementTag}`,
    {
      className: `bc-browser-${browser} bc-supports-${isSupported} ${
        elementTag === "dt" ? "bc-supports" : ""
      }`,
      key: `${browser}-compat`,
      onClick:
        (hasChildren &&
          (() => {
            onNotesClick(index);
          })) ||
        null,
      "aria-expanded": hasChildren ? currentNoteId === index : null,
      "aria-controls": hasChildren ? `${index}` : null,
      tabIndex: hasChildren ? 0 : null,
    },
    [
      elementTag === "td" && (
        <span key={`${browser}-name`} className="bc-browser-name">
          <BrowserName browserNameKey={browser} />
        </span>
      ),
      <abbr
        key={`${browser}-support`}
        className={`bc-level-${isSupported} only-icon`}
        title={bcSupport}
      >
        <span>{bcSupport}</span>
      </abbr>,
      <span key={`${browser}-content`}>{textContent}</span>,
      <div key={`${browser}-icons`} className="bc-icons">
        <abbr className="only-icon" title={`${bcIconTitle}`}>
          <span>Notes</span>
          <i className={`${bcIcon}`} />
        </abbr>
      </div>,
      children,
    ]
  );
};
