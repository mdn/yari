import React, { lazy, Suspense, useEffect, useState } from "react";
import useSWR from "swr";

import { DisplayH2 } from "./ingredients/utils";

const BrowserCompatibilityTable = lazy(
  () => import("./ingredients/browser-compatibility-table")
);

const isServer = typeof window === "undefined";

export function LazyBrowserCompatibilityTable({
  id,
  title,
  query,
  dataURL,
}: {
  id: string;
  title: string;
  query: string;
  dataURL: string;
}) {
  return (
    <>
      {title && <DisplayH2 id={id} title={title} />}
      <LazyBrowserCompatibilityTableInner dataURL={dataURL} />
    </>
  );
}

function LazyBrowserCompatibilityTableInner({ dataURL }: { dataURL: string }) {
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
      <BrowserCompatibilityTable {...data} />
    </Suspense>
  );
}

function Loading() {
  return <p>Loading BCD table...</p>;
}
