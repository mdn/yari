import React, { lazy, Suspense, useEffect, useState } from "react";
import useSWR from "swr";

import { DisplayHeading } from "./ingredients/utils";
import { Loading } from "../ui/atoms/loading";
// Because it's bad for web performance to lazy-load CSS during the initial render
// (because the page is saying "Wait! Stop rendering, now that I've downloaded
// some JS I decided I need more CSSOM to block the rendering.")
// Therefore, we import all the necessary CSS here in this file so that
// the BCD table CSS becomes part of the core bundle.
// That means that when the lazy-loading happens, it only needs to lazy-load
// the JS (and the JSON XHR fetch of course)
import "./ingredients/browser-compatibility-table/index.scss";
import { useLocale } from "../hooks";

const BrowserCompatibilityTable = lazy(
  () =>
    import(
      /* webpackChunkName: "browser-compatibility-table" */ "./ingredients/browser-compatibility-table"
    )
);

const isServer = typeof window === "undefined";

export function LazyBrowserCompatibilityTable({
  id,
  title,
  isH3,
  isH4,
  query,
  dataURL,
}: {
  id: string;
  title: string;
  isH3: boolean;
  isH4: boolean;
  query: string;
  dataURL: string | null;
}) {
  return (
    <>
      {<DisplayHeading level={isH4 ? 4 : isH3 ? 3 : 2} id={id} title={title} />}

      {dataURL ? (
        <LazyBrowserCompatibilityTableInner dataURL={dataURL} />
      ) : (
        <div className="notecard warning">
          <p>
            No compatibility data found for <code>{query}</code>.<br />
            <a href="#on-github">Check for problems with this page</a> or
            contribute missing data to{" "}
            <a href="https://github.com/mdn/browser-compat-data">
              mdn/browser-compat-data
            </a>
            .
          </p>
        </div>
      )}
    </>
  );
}

function LazyBrowserCompatibilityTableInner({ dataURL }: { dataURL: string }) {
  const locale = useLocale();
  const [bcdDataURL, setBCDDataURL] = useState("");

  const { error, data } = useSWR(
    bcdDataURL ? bcdDataURL : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    },
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    setBCDDataURL(dataURL);
  }, [dataURL]);

  if (isServer) {
    return <p>BCD tables only load in the browser</p>;
  }
  if (!data && !error) {
    return <Loading />;
  }
  if (error) {
    return <p>Error loading BCD data</p>;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading message="Loading BCD table" />}>
        <BrowserCompatibilityTable locale={locale} {...data} />
      </Suspense>
    </ErrorBoundary>
  );
}

type ErrorBoundaryProps = {};
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
        <div className="notecard negative">
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
        </div>
      );
    }

    return this.props.children;
  }
}
