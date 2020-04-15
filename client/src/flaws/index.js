import React from "react";
import { Link } from "@reach/router";
import useSWR from "swr";

import "./index.scss";

import { humanizeFlawName } from "../flaw-utils";

export default function AllFlaws({ locale }) {
  function makeSearchQueryString() {
    const params = new URLSearchParams();
    params.set("locale", locale);
    return params.toString();
  }
  const { data, error } = useSWR(
    `/_flaws?${makeSearchQueryString()}`,
    async (url) => {
      let response;
      try {
        response = await fetch(url);
      } catch (ex) {
        throw ex;
      }
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      if (!response.headers.get("content-type").includes("application/json")) {
        throw new Error(
          `Response is not JSON (${response.headers.get("content-type")})`
        );
      }
      // Always return a promise!
      return response.json();
    },
    { revalidateOnFocus: false }
  );

  console.log({ data, error });

  function submitHandler(event) {
    event.preventDefault();
  }

  return (
    <div id="all-flaws">
      <h1>Find all flaws {!data && !error && <small>Loading...</small>}</h1>
      {error && <ShowSearchError error={error} />}
      <form onSubmit={submitHandler}></form>
      {data && (
        <ShowDocumentsFound counts={data.counts} documents={data.documents} />
      )}
      {data && <ShowTimes times={data.times} />}
    </div>
  );
}

function ShowSearchError({ error }) {
  return (
    <div className="attention search-error">
      <h3>Search error</h3>
      <pre>{error.toString()}</pre>
    </div>
  );
}

function ShowTimes({ times }) {
  function format(ms) {
    if (ms > 1000) {
      const s = ms / 1000;
      return `${s.toFixed(s, 1)} seconds`;
    } else {
      return `${Math.trunc(ms)} milliseconds`;
    }
  }
  const bits = [
    `possible documents: ${format(times.possible)}`,
    `built documents: ${format(times.built)}`,
  ];
  return (
    <div className="search-times">
      <p>Time to find... {bits.join(", ")}</p>
    </div>
  );
}

function ShowDocumentsFound({ counts, documents }) {
  // https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac
  function getGetOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n.toLocaleString() + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function summarizeFlaws(flaws) {
    // Return a one-liner about all the flaws
    const bits = flaws.map((flaw) => {
      return `${humanizeFlawName(flaw.name)}: ${flaw.value}`;
    });
    return bits.join(", ");
  }

  return (
    <div className="documents-found">
      <h3>Documents with flaws found ({counts.found})</h3>
      {!counts.built ? (
        <WarnAboutNothingBuilt />
      ) : (
        <h4>
          {counts.built.toLocaleString()} built documents out of a possible{" "}
          {counts.possible.toLocaleString()}
        </h4>
      )}
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Popularity ranking</th>
            <th>Flaws</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            return (
              <tr key={doc.mdn_url}>
                <td>
                  <Link to={doc.mdn_url} title={doc.title}>
                    {doc.mdn_url}
                  </Link>
                </td>
                <td
                  title={
                    doc.popularity.ranking
                      ? `Meaning there are ${
                          doc.popularity.ranking - 1
                        } more popular pages than this`
                      : "Meaning it has no ranking. Most likely a very rare (or new) document"
                  }
                >
                  {!doc.popularity.ranking
                    ? "n/a"
                    : `${getGetOrdinal(doc.popularity.ranking)}`}
                </td>
                <td>{summarizeFlaws(doc.flaws)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WarnAboutNothingBuilt() {
  return (
    <div className="attention document-warnings">
      <h4>No documents have been built, so no flaws can be found</h4>
      <p>
        At the moment, you have to use the command line tools to build documents
        that we can analyze.
      </p>
    </div>
  );
}
