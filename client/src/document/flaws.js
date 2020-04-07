import React from "react";
import { useEffect } from "react";

function Flaws({ flaws }) {
  return (
    <div id="document-flaws">
      {flaws.map((flaw) => {
        if (flaw.flawCheck === "broken_links") {
          return <BrokenLinks key="broken_links" urls={flaw.flaws} />;
        } else {
          throw new Error(`Unknown flaw check '${flaw.flawCheck}'`);
        }
      })}
      {/* <pre>{JSON.stringify(flaws)}</pre> */}
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
  useEffect(() => {
    for (const url of Object.keys(counts)) {
      fetch(url).then((response) => {
        console.log(response);
      });
    }
  }, [counts]);
  return (
    <div className="flaw flaw__broken_links">
      <h3>Broken Links</h3>
      <ol>
        {Object.entries(counts).map(([url, times]) => {
          return (
            <li key={url}>
              <code>{url}</code>{" "}
              <i>
                {times} {times === 1 ? "time" : "times"}
              </i>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
