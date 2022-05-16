import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import type bcd from "@mdn/browser-compat-data/types";
import { BrowserInfoContext } from "./browser-info";
import {
  asList,
  getCurrentSupport,
  hasNoteworthyNotes,
  isFullySupportedWithoutLimitation,
  isNotSupportedAtAll,
  isOnlySupportedWithAltName,
  isOnlySupportedWithFlags,
  isOnlySupportedWithPrefix,
  isTruthy,
  versionIsPreview,
  SupportStatementExtended,
} from "./utils";

// Yari builder will attach extra keys from the compat data
// it gets from @mdn/browser-compat-data. These are "Yari'esque"
// extras that helps us avoiding to have a separate data structure.
interface CompatStatementExtended extends bcd.CompatStatement {
  // When a compat statement has a .mdn_url but it's actually not a good
  // one, the Yari builder will attach an extra boolean that indicates
  // that it's not a valid link.
  // Note, it's only 'true' if it's present, hence this interface definition.
  bad_url?: true;
}

function getSupportClassName(
  support: SupportStatementExtended | undefined,
  browser: bcd.BrowserStatement
): string {
  if (!support) {
    return "unknown";
  }

  let { flags, version_added, version_removed, partial_implementation } =
    getCurrentSupport(support)!;

  let className;
  if (version_added === null) {
    className = "unknown";
  } else if (versionIsPreview(version_added, browser)) {
    className = "preview";
  } else if (version_added) {
    className = "yes";
    if (version_removed || (flags && flags.length)) {
      className = "no";
    }
  } else {
    className = "no";
  }
  if (partial_implementation && !version_removed) {
    className = "partial";
  }

  return className;
}

function getSupportBrowserReleaseDate(
  support: SupportStatementExtended | undefined
): string | undefined {
  if (!support) {
    return undefined;
  }
  return getCurrentSupport(support)!.release_date;
}

function StatusIcons({ status }: { status: bcd.StatusBlock }) {
  const { t } = useTranslation("bcd");

  const icons = [
    status.experimental && "experimental",
    status.deprecated && "deprecated",
    !status.standard_track && "nonstandard",
  ]
    .filter(isTruthy)
    .map((icon) => ({
      title: t(`compatLabels.${icon}.title`),
      text: t(`compatLabels.${icon}.label`),
      iconClassName: `icon-${icon}`,
    }));

  return icons.length === 0 ? null : (
    <div className="bc-icons" data-test={icons.length}>
      {icons.map((icon) => (
        <abbr
          key={icon.iconClassName}
          className={`only-icon icon ${icon.iconClassName}`}
          title={icon.title}
        >
          <span>{icon.text}</span>
        </abbr>
      ))}
    </div>
  );
}

function labelFromString(
  version: string | boolean | null | undefined,
  browser: bcd.BrowserStatement
) {
  if (typeof version !== "string") {
    return <>{"?"}</>;
  }
  // Treat BCD ranges as exact versions to avoid confusion for the reader
  // See https://github.com/mdn/yari/issues/3238
  if (version.startsWith("≤")) {
    return <>{version.slice(1)}</>;
  }
  if (version === "preview") {
    return browser.preview_name;
  }
  return <>{version}</>;
}

const CellText = React.memo(
  ({
    support,
    browser,
  }: {
    support: bcd.SupportStatement | undefined;
    browser: bcd.BrowserStatement;
  }) => {
    const currentSupport = getCurrentSupport(support);
    const { t } = useTranslation("bcd");

    const added = currentSupport?.version_added ?? null;
    const removed = currentSupport?.version_removed ?? null;

    const browserReleaseDate = getSupportBrowserReleaseDate(support);

    let status:
      | { isSupported: "unknown" }
      | {
          isSupported: "no" | "yes" | "partial" | "preview";
          label?: React.ReactNode;
        };

    switch (added) {
      case null:
        status = { isSupported: "unknown" };
        break;
      case true:
        status = { isSupported: "yes" };
        break;
      case false:
        status = { isSupported: "no" };
        break;
      case "preview":
        status = { isSupported: "preview" };
        break;
      default:
        if (versionIsPreview(added, browser)) {
          status = {
            isSupported: "preview",
            label: labelFromString(added, browser),
          };
        } else if (currentSupport?.flags?.length) {
          status = {
            isSupported: "no",
            label: labelFromString(added, browser),
          };
        } else {
          status = {
            isSupported: "yes",
            label: labelFromString(added, browser),
          };
        }
        break;
    }

    if (removed) {
      status = {
        isSupported: "no",
        label: (
          <>
            {labelFromString(added, browser)}&#8202;&ndash;&#8202;
            {labelFromString(removed, browser)}
          </>
        ),
      };
    } else if (currentSupport && currentSupport.partial_implementation) {
      status = {
        isSupported: "partial",
        label:
          typeof added === "string"
            ? labelFromString(added, browser)
            : t("compatLabels.partial.label"),
      };
    }

    let label: string | React.ReactNode;
    let title = t(`compatLabels.${status.isSupported}.title`);
    switch (status.isSupported) {
      case "yes":
      case "partial":
      case "no":
        label = status.label || t(`compatLabels.${status.isSupported}.label`);
        break;

      case "preview":
        label = status.label || browser.preview_name;
        break;

      case "unknown":
        label = t(`compatLabels.${status.isSupported}.label`);
        break;
    }
    const supportClassName = getSupportClassName(support, browser);

    return (
      <div className="bcd-cell-text-wrapper">
        <div className="bcd-cell-icons">
          <span className="icon-wrap">
            <abbr
              className={`
              bc-level-${supportClassName}
              icon
              icon-${supportClassName}`}
              title={title}
            >
              <span className="bc-support-level">{title}</span>
            </abbr>
          </span>
        </div>
        <div className="bcd-cell-text-copy">
          <span className="bc-browser-name">{browser.name}</span>
          <span
            className="bc-version-label"
            title={
              browserReleaseDate
                ? t("releaseDate", { browserReleaseDate })
                : undefined
            }
          >
            {label}
          </span>
        </div>
        <CellIcons support={support} />
      </div>
    );
  }
);

function Icon({ name }: { name: string }) {
  const { t } = useTranslation("bcd");

  return (
    <abbr className="only-icon" title={t(`compatLabels.${name}.title`)}>
      <span>{name}</span>
      <i className={`icon icon-${name}`} />
    </abbr>
  );
}

function CellIcons({ support }: { support: bcd.SupportStatement | undefined }) {
  const supportItem = getCurrentSupport(support);
  if (!supportItem) {
    return null;
  }

  const icons = [
    isOnlySupportedWithPrefix(support) && <Icon key="prefix" name="prefix" />,
    hasNoteworthyNotes(supportItem) && <Icon key="footnote" name="footnote" />,
    isOnlySupportedWithAltName(support) && (
      <Icon key="altname" name="altname" />
    ),
    isOnlySupportedWithFlags(support) && (
      <Icon key="disabled" name="disabled" />
    ),
  ].filter(Boolean);

  return icons.length ? <div className="bc-icons">{icons}</div> : null;
}

function FlagsNote({
  supportItem,
  browser,
}: {
  supportItem: bcd.SimpleSupportStatement;
  browser: bcd.BrowserStatement;
}) {
  const { t } = useTranslation("bcd");
  const hasAddedVersion = typeof supportItem.version_added === "string";
  const hasRemovedVersion = typeof supportItem.version_removed === "string";
  const flags = supportItem.flags || [];
  return (
    <>
      {t(
        `flagNotes.${
          hasAddedVersion && hasRemovedVersion
            ? "addedAndRemoved"
            : hasAddedVersion
            ? "added"
            : "removed"
        }`,
        {
          versionAdded: supportItem.version_added,
          versionRemoved: supportItem.version_removed,
        }
      )}
      {t("flagNotes.main")}
      {flags.map((flag, i) => (
        <React.Fragment key={flag.name}>
          {t(`flagNotes.${flag.type}`, {
            flag: flag.name,
          })}
          {flag.value_to_set &&
            t("flagNotes.valueToSet", { value: flags["value_to_set"] })}
          {i < flags.length - 1 && t("flagNotes.multipleFlags")}
        </React.Fragment>
      ))}
      .
      {browser.pref_url &&
        flags.some((flag) => flag.type === "preference") &&
        t("flagNotes.preferencesHowTo", {
          browser: browser.name,
          prefUrl: browser.pref_url,
        })}
    </>
  );
}

function getNotes(
  browser: bcd.BrowserStatement,
  support: bcd.SupportStatement,
  locale: string,
  t: Function
) {
  if (support) {
    return asList(support)
      .slice()
      .reverse()
      .flatMap((item, i) => {
        const supportNotes = [
          item.version_removed &&
          !asList(support).some(
            (otherItem) => otherItem.version_added === item.version_removed
          )
            ? {
                iconName: "disabled",
                label: (
                  <>
                    Removed in {labelFromString(item.version_removed, browser)}{" "}
                    and later
                  </>
                ),
              }
            : null,
          item.partial_implementation
            ? {
                iconName: "footnote",
                label: t("compatLabels.partial.title"),
              }
            : null,
          item.prefix
            ? {
                iconName: "prefix",
                label: t("compatLabels.prefix.description", {
                  prefix: item.prefix,
                }),
              }
            : null,
          item.alternative_name
            ? {
                iconName: "altname",
                label: t("compatLabels.prefix.description", {
                  altname: item.alternative_name,
                }),
              }
            : null,
          item.flags
            ? {
                iconName: "disabled",
                label: <FlagsNote browser={browser} supportItem={item} />,
              }
            : null,
          item.notes
            ? (Array.isArray(item.notes) ? item.notes : [item.notes]).map(
                (note) => ({ iconName: "footnote", label: note })
              )
            : null,
          versionIsPreview(item.version_added, browser)
            ? {
                iconName: "footnote",
                label: t("compatLabels.preview.description"),
              }
            : null,
          // If we encounter nothing else than the required `version_added` and
          // `release_date` properties, assume full support.
          // EDIT 1-5-21: if item.version_added doesn't exist, assume no support.
          isFullySupportedWithoutLimitation(item) &&
          !versionIsPreview(item.version_added, browser)
            ? {
                iconName: "footnote",
                label: t("compatLabels.yes.title"),
              }
            : isNotSupportedAtAll(item)
            ? {
                iconName: "footnote",
                label: t("compatLabels.no.title"),
              }
            : null,
        ]
          .flat()
          .filter(isTruthy);

        const hasNotes = supportNotes.length > 0;
        return (
          (i === 0 || hasNotes) && (
            <React.Fragment key={i}>
              <div className="bc-notes-wrapper">
                <dt
                  className={`bc-supports-${getSupportClassName(
                    item,
                    browser
                  )} bc-supports`}
                >
                  <CellText support={item} browser={browser} />
                </dt>
                {supportNotes.map(({ iconName, label }, i) => {
                  return (
                    <dd className="bc-supports-dd" key={i}>
                      <Icon name={iconName} />{" "}
                      {typeof label === "string" ? (
                        <span dangerouslySetInnerHTML={{ __html: label }} />
                      ) : (
                        label
                      )}
                    </dd>
                  );
                })}
                {!hasNotes && <dd />}
              </div>
            </React.Fragment>
          )
        );
      })
      .filter(isTruthy);
  }
}

function CompatCell({
  browserId,
  browserInfo,
  support,
  showNotes,
  onToggle,
}: {
  browserId: bcd.BrowserNames;
  browserInfo: bcd.BrowserStatement;
  support: bcd.SupportStatement | undefined;
  showNotes: boolean;
  onToggle: () => void;
}) {
  const { t, i18n } = useTranslation("bcd");

  const supportClassName = getSupportClassName(support, browserInfo);
  // NOTE: 1-5-21, I've forced hasNotes to return true, in order to
  // make the details view open all the time.
  // Whenever the support statement is complex (array with more than one entry)
  // or if a single entry is complex (prefix, notes, etc.),
  // we need to render support details in `bc-history`
  // const hasNotes =
  //   support &&
  //   (asList(support).length > 1 ||
  //     asList(support).some(
  //       (item) =>
  //         item.prefix || item.notes || item.alternative_name || item.flags
  //     ));
  const notes = getNotes(browserInfo, support!, i18n.language, t);
  const content = (
    <>
      <CellText {...{ support }} browser={browserInfo} />
      {showNotes && (
        <dl className="bc-notes-list bc-history bc-history-mobile">{notes}</dl>
      )}
    </>
  );

  return (
    <>
      <td
        className={`bc-support bc-browser-${browserId} bc-supports-${supportClassName} ${
          notes ? "bc-has-history" : ""
        }`}
        aria-expanded={showNotes ? "true" : "false"}
        onClick={notes ? () => onToggle() : undefined}
      >
        <button type="button" disabled={!notes} title={t("toggleHistory")}>
          {content}
          <span className="offscreen">{t("toggleHistory")}</span>
        </button>
      </td>
    </>
  );
}

export const FeatureRow = React.memo(
  ({
    index,
    feature,
    browsers,
    activeCell,
    onToggleCell,
  }: {
    index: number;
    feature: {
      name: string;
      compat: CompatStatementExtended;
      depth: number;
    };
    browsers: bcd.BrowserNames[];
    activeCell: number | null;
    onToggleCell: ([row, column]: [number, number]) => void;
  }) => {
    const browserInfo = useContext(BrowserInfoContext);
    const { t, i18n } = useTranslation("bcd");

    if (!browserInfo) {
      throw new Error(t("error.missingBrowserInfo"));
    }

    const { name, compat, depth } = feature;
    const title = compat.description ? (
      <span dangerouslySetInnerHTML={{ __html: compat.description }} />
    ) : (
      <code>{name}</code>
    );
    const activeBrowser = activeCell !== null ? browsers[activeCell] : null;

    let titleNode: string | React.ReactNode;

    if (compat.bad_url && compat.mdn_url) {
      titleNode = (
        <div className="bc-table-row-header">
          <abbr
            className="new"
            title={t("error.mdnUrlInvalid", { mdnUrl: compat.mdn_url })}
          >
            {title}
          </abbr>
          {compat.status && <StatusIcons status={compat.status} />}
        </div>
      );
    } else if (compat.mdn_url && depth > 0) {
      titleNode = (
        <a href={compat.mdn_url} className="bc-table-row-header">
          {title}
          {compat.status && <StatusIcons status={compat.status} />}
        </a>
      );
    } else {
      titleNode = (
        <div className="bc-table-row-header">
          {title}
          {compat.status && <StatusIcons status={compat.status} />}
        </div>
      );
    }

    return (
      <>
        <tr>
          <th className={`bc-feature bc-feature-depth-${depth}`} scope="row">
            {titleNode}
          </th>
          {browsers.map((browser, i) => (
            <CompatCell
              key={browser}
              browserId={browser}
              browserInfo={browserInfo[browser]}
              support={compat.support[browser]}
              showNotes={activeCell === i}
              onToggle={() => onToggleCell([index, i])}
            />
          ))}
        </tr>
        {activeBrowser && (
          <tr className="bc-history bc-history-desktop">
            <td colSpan={browsers.length + 1}>
              <dl className="bc-notes-list">
                {getNotes(
                  browserInfo[activeBrowser],
                  compat.support[activeBrowser]!,
                  i18n.language,
                  t
                )}
              </dl>
            </td>
          </tr>
        )}
      </>
    );
  }
);
