import React, { useEffect } from "react";
import useSWR from "swr";
import { humanizeFlawName } from "../flaw-utils";
import "./flaws.scss";

interface FlawCheck {
  count: number;
  name: string;
  flaws: any[];
}

function Flaws({ flaws }: { flaws: FlawCheck[] }) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This shouldn't be used in non-development builds");
  }
  return (
    <div id="document-flaws">
      {flaws.map((flaw) => {
        switch (flaw.name) {
          case "broken_links":
            return <BrokenLinks key="broken_links" urls={flaw.flaws} />;
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

export default Flaws;

function BrokenLinks({ urls }: { urls: string[] }) {
  // urls has repeats so turn it into a count for each
  const urlsWithCount = Array.from(
    urls
      .reduce<Map<string, number>>(
        (map, url) => map.set(url, (map.get(url) || 0) + 1),
        new Map()
      )
      .entries()
    // If we don't sort them, their visual presence isn't predictable.
  ).sort(([url1], [url2]) => url1.localeCompare(url2));

  const params = new URLSearchParams(urls.map((url) => ["url", url]));
  const { data, error } = useSWR(
    `/_redirects?${params.toString()}`,
    (url) => {
      return fetch(url).then((r) => {
        if (!r.ok) {
          throw new Error(`${r.status} on ${url}`);
        }
        return r.json();
      });
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    const flawedAnchors = [
      ...Object.entries(data ? data.redirects : {})
        .filter(([uri, correctURI]) => !!correctURI)
        .map(([uri, correctURI]) => ({
          href: uri,
          title: `Consider fixing! It's actually a redirect to ${correctURI}`,
          className: "flawed--broken_link_redirect",
        })),
      ...urls.map((uri) => ({
        href: uri,
        title: "Links to a page that will 404 Not Found",
        className: "flawed--broken_link_404",
      })),
    ].flatMap(({ href, title, className }) =>
      Array.from(
        document.querySelectorAll<HTMLAnchorElement>(
          `div.content a[href='${href}']`
        )
      ).map((anchor) => {
        anchor.classList.add(className);
        anchor.title = title;
        return anchor;
      })
    );

    return () => {
      for (const anchor of flawedAnchors) {
        anchor.classList.remove(
          "flawed--broken_link_redirect",
          "flawed--broken_link_404"
        );
        anchor.title = "";
      }
    };
  }, [data, urls]);

  return (
    <div className="flaw flaw__broken_links">
      <h3>Broken Links</h3>
      {!data && !error && (
        <p>
          <i>Checking all URLs for redirects...</i>
        </p>
      )}
      {error && (
        <p>
          <b>Error checking for redirects:</b> <pre>{error.toString()}</pre>
        </p>
      )}
      <ol>
        {urlsWithCount.map(([url, count]) => (
          <li key={url}>
            <code>{url}</code>{" "}
            <i>
              {count} {count === 1 ? "time" : "times"}
            </i>{" "}
            {data && data.redirects[url] && (
              <span>
                <b>Actually a redirect!</b> to...{" "}
                <code>{data.redirects[url]}</code>
              </span>
            )}
          </li>
        ))}
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
