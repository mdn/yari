import React from "react";
import useSWR from "swr";

import "./flaws.scss";

function Flaws({ flaws }) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("This shouldn't be used in non-development builds");
  }
  return (
    <div id="document-flaws">
      {flaws.map((flaw) => {
        if (flaw.flawCheck === "broken_links") {
          return <BrokenLinks key="broken_links" urls={flaw.flaws} />;
        } else if (flaw.flawCheck === "bad_bcd_queries") {
          return <BadBCDQueries key="bad_bcd_queries" messages={flaw.flaws} />;
        } else {
          throw new Error(`Unknown flaw check '${flaw.flawCheck}'`);
        }
      })}
    </div>
  );
}

export default Flaws;

function BrokenLinks({ urls }) {
  // TODO:
  // This component should probably scan the DOM for the `<a>` elements
  // whose `href=` is considered broken.
  // // a.attr("title", `The link to ${href} is broken.`);
  // // a.addClass("flawed--broken_link");

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
      <h3>Bad BCD Queries</h3>
      <pre>{JSON.stringify(messages)}</pre>
    </div>
  );
}
