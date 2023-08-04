import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { WRITER_MODE, PLACEMENT_ENABLED } from "../env";
import { useGA } from "../ga-context";
import { useIsServer, useLocale } from "../hooks";

import {
  useDocumentURL,
  useCopyExamplesToClipboardAndAIExplain,
  useRunSample,
} from "./hooks";
import { Doc } from "../../../libs/types/document";
// Ingredients
import { Prose } from "./ingredients/prose";
import { LazyBrowserCompatibilityTable } from "./lazy-bcd-table";
import { SpecificationSection } from "./ingredients/spec-section";

// Misc
// Sub-components
import { TopNavigation } from "../ui/organisms/top-navigation";
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { LocalizedContentNote } from "./molecules/localized-content-note";
import { OfflineStatusBar } from "../ui/molecules/offline-status-bar";
import { TOC } from "./organisms/toc";
import { RenderSideBar } from "./organisms/sidebar";
import { RetiredLocaleNote } from "./molecules/retired-locale-note";
import { MainContentContainer } from "../ui/atoms/page-content";
import { Loading } from "../ui/atoms/loading";
import { Metadata } from "./organisms/metadata";
import { PageNotFound } from "../page-not-found";

import "./index.scss";

// It's unfortunate but it is what it is at the moment. Not every page has an
// interactive example (in its HTML blob) but we don't know that in advance.
// But just in case it does, we need to have the CSS ready in the main bundle.
// Perhaps a more ideal solution would be that the interactive example <iframe>
// code could come with its own styling rather than it having to be part of the
// main bundle all the time.
import "./interactive-examples.scss";
import { DocumentSurvey } from "../ui/molecules/document-survey";
import { useIncrementFrequentlyViewed } from "../plus/collections/frequently-viewed";
import { useInteractiveExamplesActionHandler as useInteractiveExamplesTelemetry } from "../telemetry/interactive-examples";
import { SidePlacement } from "../ui/organisms/placement";
import { BaselineIndicator } from "./baseline-indicator";
// import { useUIStatus } from "../ui-context";

// Lazy sub-components
const Toolbar = React.lazy(() => import("./toolbar"));
const MathMLPolyfillMaybe = React.lazy(() => import("./mathml-polyfill"));

export class HTTPError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly text: string;
  constructor(status: number, url: string, text: string) {
    super(`${status} on ${url}: ${text}`);
    this.status = status;
    this.url = url;
    this.text = text;
  }
}

export function Document(props /* TODO: define a TS interface for this */) {
  const ga = useGA();
  const isServer = useIsServer();

  const mountCounter = React.useRef(0);
  const documentURL = useDocumentURL();
  const locale = useLocale();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const previousDoc = React.useRef(null);

  const fallbackData =
    props.doc && props.doc.mdn_url.toLowerCase() === documentURL.toLowerCase()
      ? props.doc
      : null;

  const dataURL = `${documentURL}/index.json`;
  const { data: doc, error } = useSWR<Doc>(
    dataURL,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new HTTPError(response.status, url, "Page not found");

          case 504:
            if (previousDoc.current) {
              return previousDoc.current;
            }
        }

        const text = await response.text();
        throw new HTTPError(response.status, url, text);
      }

      const { doc } = await response.json();
      previousDoc.current = doc;

      if (response.redirected) {
        navigate(doc.mdn_url);
      }

      return doc;
    },
    {
      fallbackData,
      revalidateOnFocus: WRITER_MODE,
      revalidateOnMount: !fallbackData,
      refreshInterval: WRITER_MODE ? 500 : 0,
    }
  );

  useIncrementFrequentlyViewed(doc);
  useRunSample(doc);
  useCopyExamplesToClipboardAndAIExplain(doc);
  useInteractiveExamplesTelemetry();

  React.useEffect(() => {
    if (!doc && !error) {
      document.title = "⏳ Loading…";
    } else if (error) {
      document.title = "💔 Loading error";
    } else if (doc) {
      document.title = doc.pageTitle;
    }
  }, [doc, error]);

  React.useEffect(() => {
    if (doc && !error) {
      if (mountCounter.current > 0) {
        // 'dimension19' means it's a client-side navigation.
        // I.e. not the initial load but the location has now changed.
        // Note that in local development, where you use `localhost:3000`
        // this will always be true because it's always client-side navigation.
        ga("set", "dimension19", "Yes");
        ga("send", {
          hitType: "pageview",
          location: window.location.toString(),
        });
      }

      // By counting every time a document is mounted, we can use this to know if
      // a client-side navigation happened.
      mountCounter.current++;
    }
  }, [ga, doc, error]);

  React.useEffect(() => {
    const location = document.location;

    // Did you arrive on this page with a location hash?
    if (location.hash && location.hash !== location.hash.toLowerCase()) {
      // The location hash isn't lowercase. That probably means it's from before
      // we made all `<h2 id>` and `<h3 id>` values always lowercase.
      // Let's see if it can easily be fixed, but let's be careful and
      // only do this if there is an element that matches.
      try {
        if (document.querySelector(location.hash.toLowerCase())) {
          location.hash = location.hash.toLowerCase();
        }
      } catch (error) {
        if (error instanceof DOMException) {
          // You can't assume that the anchor on the page is a valid string
          // for `document.querySelector()`.
          // E.g. /en-US/docs/Web/HTML/Element/input#Form_<input>_types
          // So if that the case, just ignore the error.
          // It's not that critical to correct anyway.
        } else {
          throw error;
        }
      }
    }
  }, []);
  // const { setToastData } = useUIStatus();

  if (!doc && !error) {
    return <Loading minHeight={800} message="Loading document..." />;
  }

  if (error) {
    return (
      <>
        <div className="main-document-header-container">
          <TopNavigation />
        </div>
        <MainContentContainer>
          {error instanceof HTTPError && error.status === 404 ? (
            <PageNotFound />
          ) : (
            <LoadingError error={error} />
          )}
        </MainContentContainer>
      </>
    );
  }

  if (!doc) {
    return null;
  }

  const retiredLocale = searchParams.get("retiredLocale");

  return (
    <>
      <div className="main-document-header-container">
        <TopNavigation />
        <ArticleActionsContainer doc={doc} />
      </div>
      {/* only include this if we are not server-side rendering */}
      {!isServer && <OfflineStatusBar />}
      {doc.isTranslated ? (
        <div className="container">
          <LocalizedContentNote isActive={doc.isActive} locale={locale} />
        </div>
      ) : (
        retiredLocale && (
          <div className="container">
            <RetiredLocaleNote locale={retiredLocale} />
          </div>
        )
      )}
      <div className="main-wrapper">
        <div className="sidebar-container">
          <RenderSideBar doc={doc} />
          <div className="toc-container">
            <aside className="toc">
              <nav>{doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}</nav>
            </aside>
            {PLACEMENT_ENABLED && <SidePlacement />}
          </div>
        </div>

        <MainContentContainer>
          {!isServer && WRITER_MODE && !props.isPreview && doc.isActive && (
            <React.Suspense fallback={<Loading message={"Loading toolbar"} />}>
              <Toolbar
                doc={doc}
                reloadPage={() => {
                  mutate(dataURL);
                }}
              />
            </React.Suspense>
          )}

          {!isServer && doc.hasMathML && (
            <React.Suspense fallback={null}>
              <MathMLPolyfillMaybe />
            </React.Suspense>
          )}
          <article className="main-page-content" lang={doc.locale}>
            <header>
              <h1>{doc.title}</h1>
              {doc.baseline && <BaselineIndicator status={doc.baseline} />}
            </header>
            <DocumentSurvey doc={doc} />
            <RenderDocumentBody doc={doc} />
            <Metadata doc={doc} locale={locale} />
          </article>
        </MainContentContainer>
      </div>
    </>
  );
}

export function RenderDocumentBody({ doc }) {
  return doc.body.map((section, i) => {
    if (section.type === "prose") {
      return <Prose key={section.value.id} section={section.value} />;
    } else if (section.type === "browser_compatibility") {
      return (
        <LazyBrowserCompatibilityTable
          key={`browser_compatibility${i}`}
          {...section.value}
        />
      );
    } else if (section.type === "specifications") {
      return (
        <SpecificationSection key={`specifications${i}`} {...section.value} />
      );
    } else {
      console.warn(section);
      throw new Error(`No idea how to handle a '${section.type}' section`);
    }
  });
}

function LoadingError({ error }) {
  return (
    <div className="main-wrapper">
      <div id="content" className="main-content loading-error">
        <h3>Loading Error</h3>
        {error instanceof window.Response ? (
          <p>
            <b>{error.status}</b> on <b>{error.url}</b>
            <br />
            <small>{error.statusText}</small>
          </p>
        ) : (
          <pre>{error.toString()}</pre>
        )}
        <p>
          <button
            className="button"
            type="button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Try reloading the page
          </button>
        </p>
      </div>
    </div>
  );
}
