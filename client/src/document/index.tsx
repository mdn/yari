import React from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { CRUD_MODE } from "../constants";
import { useGA } from "../ga-context";
import {
  useDocumentURL,
  useCopyExamplesToClipboard,
  usePersistFrequentlyViewed,
} from "./hooks";
import { Doc } from "./types";
// Ingredients
import { Prose, ProseWithHeading } from "./ingredients/prose";
import { LazyBrowserCompatibilityTable } from "./lazy-bcd-table";
import { SpecificationSection } from "./ingredients/spec-section";

// Misc
// Sub-components
import { ArticleActionsContainer } from "../ui/organisms/article-actions-container";
import { LocalizedContentNote } from "./molecules/localized-content-note";
import { TOC } from "./organisms/toc";
import { RenderSideBar } from "./organisms/sidebar";
import { RetiredLocaleNote } from "./molecules/retired-locale-note";
import { MainContentContainer } from "../ui/atoms/page-content";
import { Loading } from "../ui/atoms/loading";
import { Metadata } from "./organisms/metadata";

import "./index.scss";

// It's unfortunate but it is what it is at the moment. Not every page has an
// interactive example (in its HTML blob) but we don't know that in advance.
// But just in case it does, we need to have the CSS ready in the main bundle.
// Perhaps a more ideal solution would be that the interactive example <iframe>
// code could come with its own styling rather than it having to be part of the
// main bundle all the time.
import "./interactive-examples.scss";
// import { useUIStatus } from "../ui-context";

// Lazy sub-components
const Toolbar = React.lazy(() => import("./toolbar"));
const MathMLPolyfillMaybe = React.lazy(() => import("./mathml-polyfill"));

export function Document(props /* TODO: define a TS interface for this */) {
  const ga = useGA();
  const mountCounter = React.useRef(0);
  const documentURL = useDocumentURL();
  const { locale } = useParams();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const previousDoc = React.useRef(null);

  const dataURL = `${documentURL}/index.json`;
  const { data: doc, error } = useSWR<Doc>(
    dataURL,
    async (url) => {
      const response = await fetch(url);

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new Error(`${response.status} on ${url}: Page not found`);

          case 504:
            if (previousDoc.current) {
              return previousDoc.current;
            }
        }

        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }

      const { doc } = await response.json();
      previousDoc.current = doc;

      if (response.redirected) {
        navigate(doc.mdn_url);
      }

      return doc;
    },
    {
      initialData:
        props.doc &&
        props.doc.mdn_url.toLowerCase() === documentURL.toLowerCase()
          ? props.doc
          : null,
      revalidateOnFocus: CRUD_MODE,
      refreshInterval: CRUD_MODE ? 500 : 0,
    }
  );
  usePersistFrequentlyViewed(doc);
  useCopyExamplesToClipboard(doc);

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
    return <LoadingError error={error} />;
  }

  if (!doc) {
    return null;
  }

  const isServer = typeof window === "undefined";

  return (
    <>
      <ArticleActionsContainer doc={doc} />
      {doc.isTranslated ? (
        <div className="container">
          <LocalizedContentNote isActive={doc.isActive} locale={locale} />
        </div>
      ) : (
        searchParams.get("retiredLocale") && (
          <div className="container">
            <RetiredLocaleNote />
          </div>
        )
      )}
      <div className="article-wrapper">
        <RenderSideBar doc={doc} />

        <div className="toc">
          {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}
        </div>

        <MainContentContainer>
          {!isServer && CRUD_MODE && !props.isPreview && doc.isActive && (
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
            <h1>{doc.title}</h1>
            <RenderDocumentBody doc={doc} />
            <Metadata doc={doc} locale={locale} />
          </article>
        </MainContentContainer>
      </div>
    </>
  );
}

function RenderDocumentBody({ doc }) {
  return doc.body.map((section, i) => {
    if (section.type === "prose") {
      // Only exceptional few should use the <Prose/> component,
      // as opposed to <ProseWithHeading/>.
      if (!section.value.id) {
        return (
          <Prose
            key={section.value.id || `prose${i}`}
            section={section.value}
          />
        );
      } else {
        return (
          <ProseWithHeading
            key={section.value.id}
            id={section.value.id}
            section={section.value}
          />
        );
      }
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
    <div className="standard-page">
      <div id="content" className="page-content-container loading-error">
        <h3>Loading Error</h3>
        {error instanceof window.Response ? (
          <p>
            <b>{error.status}</b> on <b>{error.url}</b>
            <br />
            <small>{error.statusText}</small>
          </p>
        ) : (
          <p>
            <code>{error.toString()}</code>
          </p>
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
