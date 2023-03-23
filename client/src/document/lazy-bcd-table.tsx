import React, { lazy, Suspense } from "react";
import useSWR from "swr";

import { DisplayH2, DisplayH3 } from "./ingredients/utils";
import { Loading } from "../ui/atoms/loading";
// Because it's bad for web performance to lazy-load CSS during the initial render
// (because the page is saying "Wait! Stop rendering, now that I've downloaded
// some JS I decided I need more CSSOM to block the rendering.")
// Therefore, we import all the necessary CSS here in this file so that
// the BCD table CSS becomes part of the core bundle.
// That means that when the lazy-loading happens, it only needs to lazy-load
// the JS (and the JSON XHR fetch of course)
import "./ingredients/browser-compatibility-table/index.scss";
import { useLocale, useIsServer } from "../hooks";
import NoteCard from "../ui/molecules/notecards";
import type BCD from "@mdn/browser-compat-data/types";
import { BCD_BASE_URL } from "../env";

interface QueryJson {
  query: string;
  data: BCD.Identifier;
  browsers: BCD.Browsers;
}

const BrowserCompatibilityTable = lazy(
  () =>
    import(
      /* webpackChunkName: "browser-compatibility-table" */ "./ingredients/browser-compatibility-table"
    )
);

export function LazyBrowserCompatibilityTable({
  id,
  title,
  isH3,
  query,
}: {
  id: string;
  title: string;
  isH3: boolean;
  query: string;
}) {
  return (
    <>
      {title && !isH3 && <DisplayH2 id={id} title={title} />}
      {title && isH3 && <DisplayH3 id={id} title={title} />}
      <LazyBrowserCompatibilityTableInner query={query} />
    </>
  );
}

function LazyBrowserCompatibilityTableInner({ query }: { query: string }) {
  const locale = useLocale();
  const isServer = useIsServer();

  const { error, data } = useSWR(
    query,
    async (query) => {
      const response = await fetch(
        `${BCD_BASE_URL}/bcd/api/v0/current/${query}.json`
      );
      if (!response.ok) {
        throw new Error(response.status.toString());
      }
      return (await response.json()) as QueryJson;
    },
    { revalidateOnFocus: false }
  );

  if (isServer) {
    return (
      <p>
        BCD tables only load in the browser
        <noscript>
          {" "}
          with JavaScript enabled. Enable JavaScript to view data.
        </noscript>
      </p>
    );
  }
  if (error) {
    if (error.message === "404") {
      return (
        <NoteCard type="warning">
          <p>
            No compatibility data found for <code>{query}</code>.<br />
            <a href="#on-github">Check for problems with this page</a> or
            contribute missing data to{" "}
            <a href="https://github.com/mdn/browser-compat-data">
              mdn/browser-compat-data
            </a>
            .
          </p>
        </NoteCard>
      );
    }
    return <p>Error loading BCD data</p>;
  }
  if (!data) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading message="Loading BCD table" />}>
        <BrowserCompatibilityTable
          locale={locale}
          query={data.query}
          data={data.data}
          browsers={data.browsers}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

type ErrorBoundaryProps = { children?: React.ReactNode };
type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  // componentDidCatch(error: Error, errorInfo) {
  //   console.log({ error, errorInfo });
  // }

  render() {
    if (this.state.error) {
      return (
        <NoteCard type="negative">
          <p>
            <strong>Error loading browser compatibility table</strong>
          </p>
          <p>
            This can happen if the JavaScript, which is loaded later, didn't
            successfully load.
          </p>
          <p>
            <a
              href="."
              className="button"
              style={{ color: "white", textDecoration: "none" }}
              onClick={(event) => {
                event.preventDefault();
                window.location.reload();
              }}
            >
              Try reloading the page
            </a>
          </p>
          <hr style={{ margin: 20 }} />
          <p>
            <small>If you're curious, this was the error:</small>
            <br />
            <small style={{ fontFamily: "monospace" }}>
              {this.state.error.toString()}
            </small>
          </p>
        </NoteCard>
      );
    }

    return this.props.children;
  }
}
