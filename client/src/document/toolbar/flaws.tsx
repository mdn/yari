import React, { useEffect, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { annotate, annotationGroup } from "rough-notation";
import { RoughAnnotation } from "rough-notation/lib/model";

import { humanizeFlawName } from "../../flaw-utils";
import { useDocumentURL } from "../hooks";
import {
  Doc,
  BrokenLink,
  MacroErrorMessage,
  BadBCDLinkFlaw,
  ImageReferenceFlaw,
  GenericFlaw,
  BadBCDQueryFlaw,
} from "../types";
import "./flaws.scss";

interface FlawCount {
  name: string;
  count: number;
}

function useAnnotations(genericFlaws: GenericFlaw[]) {
  useEffect(() => {
    const annotations: RoughAnnotation[] = [];
    const elements: HTMLElement[] = [];
    for (const flaw of genericFlaws) {
      const element = document.querySelector(
        `[data-flaw="${flaw.id}"]`
      ) as HTMLElement;
      if (!element) {
        console.warn(`Flaw ID '${flaw.id}' does not exist in the DOM`);
        continue;
      }
      elements.push(element);
      const annotationColor = flaw.suggestion ? "orange" : "red";
      element.dataset.originalTitle = element.title;

      element.title = flaw.suggestion
        ? `Flaw suggestion: ${flaw.suggestion}`
        : `Flaw explanation: ${flaw.explanation}`;
      annotations.push(
        annotate(element, {
          type: "box",
          color: annotationColor,
          animationDuration: 300,
        })
      );
    }
    const ag = annotationGroup(annotations);
    ag.show();

    return () => {
      ag.hide();

      // Now, restore any 'title' attributes that were overridden.
      for (const element of elements) {
        if (element.dataset.originalTitle !== undefined) {
          element.title = element.dataset.originalTitle;
        }
      }
    };
  }, [genericFlaws]);

  function focus(flawID: string) {
    const element = document.querySelector(
      `[data-flaw="${flawID}"]`
    ) as HTMLElement;
    if (!element) return;
    const annotations: RoughAnnotation[] = [];
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    if (element.parentElement) {
      annotations.push(
        annotate(element, {
          type: "circle",
          color: "purple",
          animationDuration: 500,
          strokeWidth: 2,
          padding: 6,
        })
      );
    }

    if (annotations.length) {
      const ag = annotationGroup(annotations);
      ag.show();
      // Only show this extra highlight temporarily
      window.setTimeout(() => {
        ag.hide();
      }, 2000);
    }
  }

  return {
    focus,
  };
}

const FLAWS_HASH = "#_flaws";
export function ToggleDocumentFlaws({ doc }: { doc: Doc }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, toggle] = useReducer((v) => !v, location.hash === FLAWS_HASH);
  const rootElement = useRef<HTMLDivElement>(null);
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current && show && rootElement.current) {
      rootElement.current.scrollIntoView({ behavior: "smooth" });
    }
    isInitialRender.current = false;
  }, [show]);

  useEffect(() => {
    const hasShowHash = window.location.hash === FLAWS_HASH;
    if (show && !hasShowHash) {
      navigate(location.pathname + location.search + FLAWS_HASH);
    } else if (!show && hasShowHash) {
      navigate(location.pathname + location.search);
    }
  }, [location, navigate, show]);

  const flawsCounts = Object.entries(doc.flaws)
    .map(([name, actualFlaws]) => ({
      name,
      count: actualFlaws.length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div id={FLAWS_HASH.slice(1)} ref={rootElement}>
      {flawsCounts.length > 0 ? (
        <button type="submit" onClick={toggle}>
          {show
            ? "Hide flaws"
            : `Show flaws (${flawsCounts
                .map((flaw) => flaw.count)
                .join(" + ")})`}
        </button>
      ) : (
        <p>
          No known flaws at the moment
          <span role="img" aria-label="yay!">
            🍾
          </span>
        </p>
      )}

      {show ? (
        <Flaws doc={doc} flaws={flawsCounts} />
      ) : (
        <small>
          {/* a one-liner about all the flaws */}
          {flawsCounts
            .map((flaw) => `${humanizeFlawName(flaw.name)}: ${flaw.count}`)
            .join(" + ")}
        </small>
      )}
    </div>
  );
}

function Flaws({ doc, flaws }: { doc: Doc; flaws: FlawCount[] }) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This shouldn't be used in non-development builds");
  }

  const fixableFlaws = Object.values(doc.flaws)
    .map((flaws) => {
      return flaws.filter(
        (flaw) => !flaw.fixed && (flaw.suggestion || flaw.fixable)
      );
    })
    .flat();

  return (
    <div id="document-flaws">
      {!!fixableFlaws.length && (
        <FixableFlawsAction count={fixableFlaws.length} />
      )}

      {flaws.map((flaw) => {
        switch (flaw.name) {
          case "broken_links":
            return (
              <BrokenLinks
                key="broken_links"
                sourceFolder={doc.source.folder}
                links={doc.flaws.broken_links}
              />
            );
          case "bad_bcd_links":
            return (
              <BadBCDLinks
                key="bad_bcd_links"
                links={doc.flaws.bad_bcd_links}
              />
            );
          case "bad_bcd_queries":
            return (
              <BadBCDQueries
                key="bad_bcd_queries"
                flaws={doc.flaws.bad_bcd_queries}
              />
            );
          case "macros":
            return (
              <Macros
                key="macros"
                sourceFolder={doc.source.folder}
                flaws={doc.flaws.macros}
              />
            );
          case "images":
            return (
              <Images
                key="images"
                sourceFolder={doc.source.folder}
                images={doc.flaws.images}
              />
            );
          default:
            throw new Error(`Unknown flaw check '${flaw.name}'`);
        }
      })}
    </div>
  );
}

function FixableFlawsAction({ count }: { count: number }) {
  const [fixing, setFixing] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [fixingError, setFixingError] = useState<Error | null>(null);

  const documentURL = useDocumentURL();

  async function fix() {
    try {
      const response = await fetch(
        `/_document/fixfixableflaws?${new URLSearchParams({
          url: documentURL,
        }).toString()}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      setFixed(true);
    } catch (error) {
      console.error("Error trying to fix fixable flaws");

      setFixingError(error);
    } finally {
      setFixing(false);
    }
  }

  if (!count) {
    return null;
  }
  return (
    <div>
      {fixingError && (
        <p style={{ color: "red" }}>
          <b>Error:</b> <code>{fixingError.toString()}</code>
        </p>
      )}
      <button
        type="button"
        onClick={async () => {
          setFixing((prev) => !prev);
          await fix();
        }}
      >
        {fixing ? "Fixing..." : `Fix fixable flaws (${count})`}
      </button>{" "}
      {fixed && <b style={{ color: "darkgreen" }}>Fixed!</b>}
    </div>
  );
}

function FixableFlawBadge() {
  return (
    <small className="macro-fixable" title="This flaw is fixable.">
      Fixable{" "}
      <span role="img" aria-label="Thumbs up">
        👍🏼
      </span>
    </small>
  );
}

function BrokenLinks({
  sourceFolder,
  links,
}: {
  sourceFolder: string;
  links: BrokenLink[];
}) {
  const [opening, setOpening] = React.useState<string | null>(null);
  useEffect(() => {
    let unsetOpeningTimer: ReturnType<typeof setTimeout>;
    if (opening) {
      unsetOpeningTimer = setTimeout(() => {
        setOpening(null);
      }, 3000);
    }
    return () => {
      if (unsetOpeningTimer) {
        clearTimeout(unsetOpeningTimer);
      }
    };
  }, [opening]);

  const filepath = sourceFolder + "/index.html";

  function openInEditor(key: string, line: number, column: number) {
    const sp = new URLSearchParams();
    sp.set("filepath", filepath);
    sp.set("line", `${line}`);
    sp.set("column", `${column}`);
    console.log(
      `Going to try to open ${filepath}:${line}:${column} in your editor`
    );
    setOpening(key);
    fetch(`/_open?${sp.toString()}`).catch((err) => {
      console.warn(`Error trying to _open?${sp.toString()}:`, err);
    });
  }

  const { focus } = useAnnotations(links);

  return (
    <div className="flaw flaw__broken_links">
      <h3>Broken Links</h3>
      <ol>
        {links.map((flaw, i) => {
          const key = `${flaw.href}${flaw.line}${flaw.column}`;
          return (
            <li
              key={key}
              className={flaw.fixed ? "fixed_flaw" : undefined}
              title={
                flaw.fixed
                  ? "This broken link has been automatically fixed."
                  : undefined
              }
            >
              <code>{flaw.href}</code>{" "}
              <span
                role="img"
                aria-label="Click to highlight broken link"
                title="Click to highlight broken link anchor"
                style={{ cursor: "zoom-in" }}
                onClick={() => {
                  focus(flaw.id);
                }}
              >
                👀
              </span>{" "}
              <a
                href={`file://${filepath}`}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  openInEditor(key, flaw.line, flaw.column);
                }}
                title="Click to open in your editor"
              >
                line {flaw.line}:{flaw.column}
              </a>{" "}
              {flaw.fixable && <FixableFlawBadge />}{" "}
              {opening && opening === key && <small>Opening...</small>}
              <br />
              {flaw.suggestion && (
                <small>
                  <b>Suggested fix:</b>
                  <code>{flaw.suggestion}</code>
                </small>
              )}{" "}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BadBCDQueries({ flaws }: { flaws: BadBCDQueryFlaw[] }) {
  return (
    <div className="flaw flaw__bad_bcd_queries">
      <h3>{humanizeFlawName("bad_bcd_queries")}</h3>
      <ul>
        {flaws.map((flaw) => (
          <li key={flaw.id}>
            <code>{flaw.explanation}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BadBCDLinks({ links }: { links: BadBCDLinkFlaw[] }) {
  return (
    <div className="flaw flaw__bad_bcd_links">
      <h3>{humanizeFlawName("bad_bcd_links")}</h3>
      <ul>
        {links.map((link) => (
          <li key={link.slug}>
            In <code>{link.query}</code> under key <code>{link.key}</code> can't
            find document: <code>{link.slug}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Macros({
  flaws,
  sourceFolder,
}: {
  flaws: MacroErrorMessage[];
  sourceFolder: string;
}) {
  const [opening, setOpening] = React.useState<string | null>(null);
  useEffect(() => {
    let unsetOpeningTimer: ReturnType<typeof setTimeout>;
    if (opening) {
      unsetOpeningTimer = setTimeout(() => {
        setOpening(null);
      }, 3000);
    }
    return () => {
      if (unsetOpeningTimer) {
        clearTimeout(unsetOpeningTimer);
      }
    };
  }, [opening]);

  function openInEditor(msg: MacroErrorMessage, key: string) {
    const sp = new URLSearchParams();
    sp.set("filepath", msg.filepath);
    sp.set("line", `${msg.line}`);
    sp.set("column", `${msg.column}`);
    console.log(
      `Going to try to open ${msg.filepath}:${msg.line}:${msg.column} in your editor`
    );
    setOpening(key);
    fetch(`/_open?${sp.toString()}`);
  }

  return (
    <div className="flaw flaw__macros">
      <h3>{humanizeFlawName("macros")}</h3>
      {flaws.map((flaw) => {
        const inPrerequisiteMacro = !flaw.filepath.includes(
          `${sourceFolder}/index.html`
        );
        const key = `${flaw.filepath}:${flaw.line}:${flaw.column}`;

        return (
          <details
            key={key}
            className={flaw.fixed ? "fixed_flaw" : undefined}
            title={
              flaw.fixed
                ? "This macro flaw has been automatically fixed."
                : undefined
            }
          >
            <summary>
              <a
                href={`file://${flaw.filepath}`}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  openInEditor(flaw, key);
                }}
              >
                <code>{flaw.name}</code> from <code>{flaw.macroName}</code> in
                line {flaw.line}:{flaw.column}
              </a>{" "}
              {opening && opening === key && <small>Opening...</small>}{" "}
              {inPrerequisiteMacro && (
                <small
                  className="macro-filepath-in-prerequisite"
                  title={`This page depends on a macro expansion inside ${flaw.filepath}`}
                >
                  In prerequisite macro
                </small>
              )}{" "}
              {flaw.fixable && <FixableFlawBadge />}{" "}
            </summary>
            {flaw.fixable && flaw.suggestion && (
              <>
                <b>Suggestion:</b>
                <pre>
                  <del>{flaw.macroSource}</del>
                  <br />
                  <ins>{flaw.suggestion}</ins>
                </pre>
              </>
            )}
            <b>Context:</b>
            <pre>{flaw.sourceContext}</pre>
            <b>Original error stack:</b>
            <pre>{flaw.errorStack}</pre>
            <b>Filepath:</b>{" "}
            {inPrerequisiteMacro && (
              <i className="macro-filepath-in-prerequisite">
                Note that this is different from the page you're currently
                viewing.
              </i>
            )}
            <br />
            <code>{flaw.filepath}</code>
          </details>
        );
      })}
    </div>
  );
}

function Images({
  sourceFolder,
  images,
}: {
  sourceFolder: string;
  images: ImageReferenceFlaw[];
}) {
  // XXX rewrite to a hook
  const [opening, setOpening] = React.useState<string | null>(null);
  useEffect(() => {
    let unsetOpeningTimer: ReturnType<typeof setTimeout>;
    if (opening) {
      unsetOpeningTimer = setTimeout(() => {
        setOpening(null);
      }, 3000);
    }
    return () => {
      if (unsetOpeningTimer) {
        clearTimeout(unsetOpeningTimer);
      }
    };
  }, [opening]);

  const filepath = sourceFolder + "/index.html";

  function openInEditor(key: string, line: number, column: number) {
    const sp = new URLSearchParams();
    sp.set("filepath", filepath);
    sp.set("line", `${line}`);
    sp.set("column", `${column}`);
    console.log(
      `Going to try to open ${filepath}:${line}:${column} in your editor`
    );
    setOpening(key);
    fetch(`/_open?${sp.toString()}`).catch((err) => {
      console.warn(`Error trying to _open?${sp.toString()}:`, err);
    });
  }

  const { focus } = useAnnotations(images);

  return (
    <div className="flaw flaw__images">
      <h3>{humanizeFlawName("images")}</h3>
      <ul>
        {images.map((image, i) => {
          const key = `${image.src}${image.line}${image.column}`;
          return (
            <li key={key}>
              <code>{image.src}</code>{" "}
              <span
                role="img"
                aria-label="Click to highlight image"
                title="Click to highlight image"
                style={{ cursor: "zoom-in" }}
                onClick={() => {
                  focus(image.id);
                }}
              >
                👀
              </span>{" "}
              <a
                href={`file://${filepath}`}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  openInEditor(key, image.line, image.column);
                }}
                title="Click to open in your editor"
              >
                line {image.line}:{image.column}
              </a>{" "}
              <small>{image.explanation}</small>{" "}
              {image.suggestion && (
                <span>
                  Suggested fix: <code>{image.suggestion}</code>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
