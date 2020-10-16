import React, { useEffect, useState } from "react";
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

interface Suggestion {
  text: string;
  total: Total;
}

export default function SearchResults({ query }: { query: URLSearchParams }) {
  const fetchURL = `/_search?${query.toString()}`;
  const { data, error } = useSWR(
    fetchURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: process.env.NODE_ENV === "development",
    }
  );

  if (error) {
    return (
      <div>
        <h4>Search error</h4>
        <p>{error.toString()}</p>
      </div>
    );
  }
  if (data) {
    return <Results {...data} query={query} />;
  }
  // else...
  return (
    <div className="loading-wrapper">
      <p>Loading search results...</p>
    </div>
  );
}

function Results({
  documents,
  metadata,
  suggestions,
  query,
}: {
  documents: Document[];
  metadata: Metadata;
  suggestions: Suggestion[];
  query: URLSearchParams;
}) {
  return (
    <FadeIn delay={50}>
      <div className="search-results">
        <p>
          Found <ShowTotal total={metadata.total} /> in {metadata.took}{" "}
          milliseconds.
        </p>

        {!!suggestions.length && (
          <div className="suggestions">
            <p>Did you mean...</p>
            <ul>
              {suggestions.map((suggestion) => {
                const newQuery = new URLSearchParams(query);
                newQuery.set("q", suggestion.text);
                return (
                  <li key={suggestion.text}>
                    <Link to={`?${newQuery}`}>{suggestion.text}</Link>{" "}
                    <ShowTotal total={suggestion.total} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}

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
    </FadeIn>
  );
}

function ShowTotal({ total }: { total: Total }) {
  return (
    <>
      {total.relation === "gt" && "more than"} {total.value.toLocaleString()}{" "}
      matches
    </>
  );
}

interface FadeInProps {
  delay?: number;
  children: React.ReactNode;
}

function FadeIn(props: FadeInProps) {
  const [maxIsVisible, setMaxIsVisible] = useState(0);

  useEffect(() => {
    const count = React.Children.count(props.children);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i > count) clearInterval(interval);
      setMaxIsVisible(i);
    }, props.delay || 50);
    return () => clearInterval(interval);
  });

  const transitionDuration = 300;
  return (
    <div>
      {React.Children.map(props.children, (child, i) => {
        return (
          <div
            style={{
              transition: `opacity ${transitionDuration}ms, transform ${transitionDuration}ms`,
              // transform: maxIsVisible > i ? "none" : "translateY(0px)",
              opacity: maxIsVisible > i ? 1 : 0,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
