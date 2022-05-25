import React, { lazy, Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import { useTranslation, Trans } from "react-i18next";

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
import { useIsServer } from "../hooks";
import NoteCard from "../ui/molecules/notecards";

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
  dataURL,
}: {
  id: string;
  title: string;
  isH3: boolean;
  query: string;
  dataURL: string | null;
}) {
  const { t } = useTranslation("bcd");
  return (
    <>
      {title && !isH3 && <DisplayH2 id={id} title={title} />}
      {title && isH3 && <DisplayH3 id={id} title={title} />}
      {dataURL ? (
        <LazyBrowserCompatibilityTableInner dataURL={dataURL} />
      ) : (
        <NoteCard type="warning">
          <p>
            <Trans t={t} i18nKey="noData" values={{ query }}>
              No compatibility data found for <code>[[query]]</code>
              .<br />
              <a href="#on-github">Check for problems with this page</a> or
              contribute missing data to{" "}
              <a href="https://github.com/mdn/browser-compat-data">
                mdn/browser-compat-data
              </a>
              .
            </Trans>
          </p>
        </NoteCard>
      )}
    </>
  );
}

function LazyBrowserCompatibilityTableInner({ dataURL }: { dataURL: string }) {
  const { t } = useTranslation("bcd");
  const [bcdDataURL, setBCDDataURL] = useState("");
  const isServer = useIsServer();

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
    return (
      <p>
        <Trans t={t} i18nKey="isServer">
          BCD tables only load in the browser
          <noscript>
            {" "}
            with JavaScript enabled. Enable JavaScript to view data.
          </noscript>
        </Trans>
      </p>
    );
  }
  if (!data && !error) {
    return <Loading />;
  }
  if (error) {
    return <p>{t("error.simple")}</p>;
  }

  return (
    <ErrorBoundary t={t}>
      <Suspense fallback={<Loading message={t("loading")} />}>
        <BrowserCompatibilityTable {...data} />
      </Suspense>
    </ErrorBoundary>
  );
}

type ErrorBoundaryProps = { children?: React.ReactNode; t: Function };
type ErrorBoundaryState = {
  error: Error | null;
  t: Function;
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, t: props.t };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  // componentDidCatch(error: Error, errorInfo) {
  //   console.log({ error, errorInfo });
  // }

  render() {
    const { t } = this.state;
    if (this.state.error) {
      return (
        <NoteCard type="negative">
          <p>
            <strong>{t("error.longer")}</strong>
          </p>
          <p>{t("error.reason")}</p>
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
              {t("error.reload")}
            </a>
          </p>
          <hr style={{ margin: 20 }} />
          <p>
            <small>{t("error.debug")}</small>
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
