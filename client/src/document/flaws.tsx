import React, { useEffect } from "react";
import useSWR from "swr";
import { humanizeFlawName } from "../flaw-utils";
import "./flaws.scss";
// import { Doc } from "./types";

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
        if (flaw.name === "broken_links") {
          return <BrokenLinks key="broken_links" urls={flaw.flaws} />;
        } else if (flaw.name === "bad_bcd_queries") {
          return <BadBCDQueries key="bad_bcd_queries" messages={flaw.flaws} />;
        } else if (flaw.name === "macros") {
          return <Macros key="macros" messages={flaw.flaws} />;
        } else {
          throw new Error(`Unknown flaw check '${flaw.name}'`);
        }
      })}
    </div>
  );
}

export default Flaws;

function BrokenLinks({ urls }) {
  // urls has repeats so turn it into a count for each
  const counts = {};
  for (const u of urls) {
    if (!(u in counts)) {
      counts[u] = 0;
    }
    counts[u] += 1;
  }
  const params = new URLSearchParams();
  Object.keys(counts).forEach((url) => params.append("url", url));
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
  const urlsAsKeys = Object.keys(counts);
  // If we don't sort them, their visual presence isn't predictable.
  urlsAsKeys.sort();

  useEffect(() => {
    const areBroken = new Set(
      urlsAsKeys.map((uri) => new URL(uri, window.location.href).toString())
    );
    const areRedirects = new Map();
    if (data && data.redirects) {
      Object.entries(data.redirects).forEach(([uri, correctUri]) => {
        areRedirects.set(
          new URL(uri, window.location.href).toString(),
          correctUri
        );
      });
    }
    [
      ...document.querySelectorAll<HTMLAnchorElement>("div.content a[href]"),
    ].forEach((a) => {
      if (areRedirects.has(a.href) && areRedirects.get(a.href)) {
        a.classList.add("flawed--broken_link_redirect");
        a.title = `Consider fixing! It's actually a redirect to ${areRedirects.get(
          a.href
        )}`;
      } else if (areBroken.has(a.href)) {
        a.classList.add("flawed--broken_link_404");
        a.title = "Links to a page that will 404 Not Found";
      }
    });

    return () => {
      [
        ...document.querySelectorAll<HTMLAnchorElement>(
          "a.flawed--broken_link_redirect"
        ),
      ].forEach((a) => {
        a.classList.remove("flawed--broken_link_redirect");
        a.title = "";
      });
      [
        ...document.querySelectorAll<HTMLAnchorElement>(
          "a.flawed--broken_link_404"
        ),
      ].forEach((a) => {
        a.classList.remove("flawed--broken_link_404");
        a.title = "";
      });
    };
  }, [data, urlsAsKeys]);

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
        {urlsAsKeys.map((url) => {
          const times = counts[url];
          return (
            <li key={url}>
              <code>{url}</code>{" "}
              <i>
                {times} {times === 1 ? "time" : "times"}
              </i>{" "}
              {data && data.redirects[url] && (
                <span>
                  <b>Actually a redirect!</b> to...{" "}
                  <code>{data.redirects[url]}</code>
                </span>
              )}
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
  cause?: {
    path: string;
  };
  options: {
    name: string;
  };
  line: number;
  column: number;
  filepath: string;
  message: string;
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
                <code>{msg.options.name}</code> on line {msg.line}
              </a>
            </summary>
            <pre>{msg.message}</pre>

            {msg.cause && msg.cause.path && (
              <p className="cause">
                Cause: <code>{msg.cause.path}</code>
              </p>
            )}
          </details>
        );
      })}
      {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
    </div>
  );
}
