import React, { useEffect, useReducer, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { annotate, annotationGroup } from "rough-notation";
import { RoughAnnotation } from "rough-notation/lib/model";

import { humanizeFlawName } from "../../flaw-utils";
import { Doc } from "../types";
import "./flaws.scss";

interface FlatFlaw {
  name: string;
  flaws: string[];
  count: number;
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

  const flatFlaws: FlatFlaw[] = Object.entries(doc.flaws)
    .map(([name, actualFlaws]) => ({
      name,
      flaws: actualFlaws,
      count: actualFlaws.length,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div id={FLAWS_HASH.slice(1)} ref={rootElement}>
      {flatFlaws.length > 0 ? (
        <button type="submit" onClick={toggle}>
          {show
            ? "Hide flaws"
            : `Show flaws (${flatFlaws.map((flaw) => flaw.count).join(" + ")})`}
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
        <Flaws doc={doc} flaws={flatFlaws} />
      ) : (
        <small>
          {/* a one-liner about all the flaws */}
          {flatFlaws
            .map((flaw) => `${humanizeFlawName(flaw.name)}: ${flaw.count}`)
            .join(" + ")}
        </small>
      )}
    </div>
  );
}

interface FlawCheck {
  count: number;
  name: string;
  flaws: any[]; // XXX fixme!
}

function Flaws({ doc, flaws }: { doc: Doc; flaws: FlawCheck[] }) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This shouldn't be used in non-development builds");
  }
  return (
    <div id="document-flaws">
      {flaws.map((flaw) => {
        switch (flaw.name) {
          case "broken_links":
            return (
              <BrokenLinks key="broken_links" doc={doc} links={flaw.flaws} />
            );
          case "bad_bcd_queries":
            return (
              <BadBCDQueries key="bad_bcd_queries" messages={flaw.flaws} />
            );
          case "macros":
            return <Macros key="macros" messages={flaw.flaws} />;
          default:
            throw new Error(`Unknown flaw check '${flaw.name}'`);
        }
      })}
    </div>
  );
}

interface Link {
  href: string;
  line: number;
  column: number;
  suggestion: string | null;
  nth: number;
}

function BrokenLinks({ doc, links }: { doc: Doc; links: Link[] }) {
  // The `links` array will look something like this:
  //  [
  //    {href: 'foo', line: 12, ...},
  //    {href: 'bar', line: 44, ...},
  //    {href: 'foo', line: 53, ...},
  //  ]
  // So note that there are 2 'foo' in there. When we match this against
  // the `document.querySelectorAll("a[href]")`, how are you supposed to
  // which which of the 'foo' one you're referring to?
  // This code, makes it so that each link in the array get's an 'nth'
  // key too. It would, in our example, become:
  //  [
  //    {href: 'foo', nth: 0, line: 12, ...},
  //    {href: 'bar', nth: 0, line: 44, ...},
  //    {href: 'foo', nth: 1, line: 53, ...},
  //  ]
  // Now, when you've filtered the list of
  // all `document.querySelectorAll("a[href]")` that matches 'foo'
  // you know *which* one to pick.
  console.log("PASSED IN:");
  console.log("LINKS:", links);
  console.log("DOC.flaws:", doc.flaws);



  const indexes = {};
  links.forEach((link, i) => {
    if (!(link.href in indexes)) {
      indexes[link.href] = 0;
    }
    link.nth = indexes[link.href];
    indexes[link.href]++;
  });

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

  const filepath = doc.source.folder + "/index.html";

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

  useEffect(() => {
    const annotations: RoughAnnotation[] = [];
    // If the anchor already had a title, put it into this map.
    // That way, when we restore the titles, we know what it used to be.
    links.forEach((link) => {
      const matchedAnchors = [
        ...document.querySelectorAll<HTMLAnchorElement>("div.content a[href]"),
      ].filter(
        (anchor) =>
          anchor.href === link.href ||
          new URL(anchor.href).pathname === link.href
      );
      const anchor = matchedAnchors[link.nth];
      if (anchor) {
        const annotationColor = link.suggestion ? "orange" : "red";
        anchor.dataset.originalTitle = anchor.title;
        anchor.title = link.suggestion
          ? `Consider fixing! Suggestion: ${link.suggestion}`
          : "Broken link! Links to a page that will not be found";
        annotations.push(
          annotate(anchor, {
            type: "box",
            color: annotationColor,
            animationDuration: 300,
          })
        );
      }
    });

    const ag = annotationGroup(annotations);
    ag.show();

    return () => {
      ag.hide();

      // Now, restore any 'title' attributes that were overridden.
      for (const anchor of Array.from(
        document.querySelectorAll<HTMLAnchorElement>(`div.content a`)
      )) {
        if (anchor.dataset.originalTitle !== undefined) {
          anchor.title = anchor.dataset.originalTitle;
        }
      }
    };
  }, [links]);

  return (
    <div className="flaw flaw__broken_links">
      <h3>Broken Links</h3>
      <ol>
        {links.map((link) => {
          const key = `${link.href}${link.line}${link.column}`;
          return (
            <li key={key}>
              <code>{link.href}</code>{" "}
              {link.suggestion && (
                <span>
                  Suggested fix: <code>{link.suggestion}</code>
                </span>
              )}{" "}
              <span
                role="img"
                aria-label="Click to highlight broken link"
                title="Click to highlight broken link anchor"
                style={{ cursor: "zoom-in" }}
                onClick={() => {
                  const annotations: RoughAnnotation[] = [];

                  const matchedAnchors = [
                    ...document.querySelectorAll<HTMLAnchorElement>(
                      "div.content a[href]"
                    ),
                  ].filter(
                    (anchor) =>
                      anchor.href === link.href ||
                      new URL(anchor.href).pathname === link.href
                  );
                  const anchor = matchedAnchors[link.nth];
                  if (anchor) {
                    anchor.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });

                    if (anchor.parentElement) {
                      annotations.push(
                        annotate(anchor, {
                          type: "circle",
                          color: "purple",
                          animationDuration: 500,
                          strokeWidth: 2,
                          padding: 6,
                        })
                      );
                    }
                  }

                  if (annotations.length) {
                    const ag = annotationGroup(annotations);
                    ag.show();
                    // Only show this extra highlight temporarily
                    window.setTimeout(() => {
                      ag.hide();
                    }, 2000);
                  }
                }}
              >
                👀
              </span>{" "}
              <a
                href={`file://${filepath}`}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  openInEditor(key, link.line, link.column);
                }}
                title="Click to open in your editor"
              >
                line {link.line}:{link.column}
              </a>{" "}
              {opening && opening === key && <small>Opening...</small>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function BadBCDQueries({ messages }) {
  return (
    <div className="flaw flaw__bad_bcd_queries">
      <h3>{humanizeFlawName("bad_bcd_queries")}</h3>
      <ul>
        {messages.map((message) => (
          <li key={message}>
            <code>{message}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MacroErrorMessage {
  name: string;
  error: {
    path?: string;
  };
  errorMessage: string;
  line: number;
  column: number;
  filepath: string;
  sourceContext: string;
  macroName: string;
}

function Macros({ messages }: { messages: MacroErrorMessage[] }) {
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
      {messages.map((msg) => {
        const key = `${msg.filepath}:${msg.line}:${msg.column}`;

        return (
          <details key={key}>
            <summary>
              <a
                href={`file://${msg.filepath}`}
                onClick={(event: React.MouseEvent) => {
                  event.preventDefault();
                  openInEditor(msg, key);
                }}
              >
                <code>{msg.name}</code> from <code>{msg.macroName}</code> in
                line {msg.line}:{msg.column}
              </a>{" "}
              {opening && opening === key && <small>Opening...</small>}
            </summary>
            <b>Context:</b>
            <pre>{msg.sourceContext}</pre>
            <b>Original error message:</b>
            <pre>{msg.errorMessage}</pre>
            <b>Filepath:</b>
            <br />
            <code>{msg.filepath}</code>
          </details>
        );
      })}
    </div>
  );
}
