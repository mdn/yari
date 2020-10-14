import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";

import "./search-results.scss";

type Highlight = {
  body?: string[];
  title?: string[];
};
interface Document {
  mdn_url: string;
  title: string;
  highlight: Highlight;
  _score: number;
  popularity: number;
}

type Total = {
  value: number;
  relation: "eq" | "gt";
};

interface Metadata {
  took: number;
  total: Total;
}

export default function SearchResults({ query }: { query: URLSearchParams }) {
  const fetchURL = `/_search?${query.toString()}`;
  const { data, error } = useSWR(fetchURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${url}`);
    }
    return await response.json();
  });

  if (error) {
    return (
      <div>
        <h4>Search error</h4>
        <p>{error.toString()}</p>
      </div>
    );
  }
  if (data) {
    return <Results documents={data.documents} metadata={data.metadata} />;
  }
  // else...
  return <p>Loading search results...</p>;
}

function Results({
  documents,
  metadata,
}: {
  documents: Document[];
  metadata: Metadata;
}) {
  return (
    <div className="search-results">
      <p>
        Found {metadata.total.value.toLocaleString()} matches in {metadata.took}{" "}
        milliseconds.
      </p>
      {documents.map((document) => {
        return (
          <div key={document.mdn_url}>
            <p>
              {document.highlight.title && document.highlight.title.length ? (
                <Link
                  className="title"
                  to={document.mdn_url}
                  dangerouslySetInnerHTML={{
                    __html: document.highlight.title[0],
                  }}
                ></Link>
              ) : (
                <Link className="title" to={document.mdn_url}>
                  {document.title}
                </Link>
              )}
              {(document.highlight.body || []).map((highlight, i) => {
                return (
                  <span
                    key={`${document.mdn_url}${i}`}
                    className="highlight"
                    dangerouslySetInnerHTML={{ __html: `…${highlight}…` }}
                  ></span>
                );
              })}
              <Link className="url" to={document.mdn_url}>
                {document.mdn_url}
              </Link>
              {process.env.NODE_ENV === "development" && (
                <span className="nerd-data">
                  <b>score:</b> <code>{document._score}</code>,{" "}
                  <b>popularity:</b> <code>{document.popularity}</code>,{" "}
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
