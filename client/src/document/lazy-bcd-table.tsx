import React, { lazy, Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import { useIdleCallbackEffect } from "react-timing-hooks";

import { DisplayH2, DisplayH3 } from "./ingredients/utils";

import { useLocale } from "../hooks";

const BrowserCompatibilityTable = lazy(
  () => import("./ingredients/browser-compatibility-table")
);

const isServer = typeof window === "undefined";

export function LazyBrowserCompatibilityTable({
  id,
  title,
  isH3,
  query,
  dataURL,
}: {
  id: string;
  title: string;
  isH3: boolean;
  query: string;
  dataURL: string | null;
}) {
  return (
    <>
      {title && !isH3 && <DisplayH2 id={id} title={title} />}
      {title && isH3 && <DisplayH3 id={id} title={title} />}
      {dataURL && !isServer ? (
        <LaterLazyBrowserCompatibilityTableInner dataURL={dataURL} />
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

interface BrowserCompatibilityTableProps {
  dataURL: string;
}

function LaterLazyBrowserCompatibilityTableInner(
  props: BrowserCompatibilityTableProps
) {
  const [loadIt, setLoadIt] = React.useState(false);

  // Note, you can't use this hook in SSR, but this component isn't mounted
  // if `isServer` is true.
  useIdleCallbackEffect(() => {
    setLoadIt(true);
  }, []);

  if (loadIt) {
    return <LazyBrowserCompatibilityTableInner {...props} />;
  }
  return null;
}

function LazyBrowserCompatibilityTableInner({
  dataURL,
}: BrowserCompatibilityTableProps) {
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
    <Suspense fallback={<Loading />}>
      <BrowserCompatibilityTable locale={locale} {...data} />
    </Suspense>
  );
}

function Loading() {
  return <p>Loading BCD table...</p>;
}
