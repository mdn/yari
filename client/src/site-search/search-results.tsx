import React from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";

type Highlight = {
  body?: string[];
  title?: string[];
};
interface Document {
  mdn_url: string;
  title: string;
  highlight: Highlight;
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

  if (!data && !error) {
  }
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
    <div>
      <p>
        Found {metadata.total.value} matches in {metadata.took} milliseconds
      </p>
      {documents.map((document) => {
        return (
          <div key={document.mdn_url}>
            <p>
              <Link className="title" to={document.mdn_url}>
                {document.title}
              </Link>
              <br />
              {(document.highlight.body || []).map((highlight, i) => {
                return (
                  <span
                    key={`${document.mdn_url}${i}`}
                    className="highlight"
                    dangerouslySetInnerHTML={{ __html: highlight }}
                  ></span>
                );
              })}
              <br />
              <Link className="url" to={document.mdn_url}>
                {document.mdn_url}
              </Link>
            </p>
          </div>
        );
      })}
    </div>
  );
}
