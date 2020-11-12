import React, { lazy, Suspense, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { CRUD_MODE } from "../constants";
import { useWebSocketMessageHandler } from "../web-socket";
import { NoMatch } from "../routing";
import { useDocumentURL } from "./hooks";
import { Doc } from "./types";
// Ingredients
import { Prose, ProseWithHeading } from "./ingredients/prose";
import { InteractiveExample } from "./ingredients/interactive-example";
import { Attributes } from "./ingredients/attributes";
import { Examples } from "./ingredients/examples";
import { LinkList, LinkLists } from "./ingredients/link-lists";
import { Specifications } from "./ingredients/specifications";
import { LazyBrowserCompatibilityTable } from "./lazy-bcd-table";

// Misc
// Sub-components
import { Breadcrumbs } from "../ui/molecules/breadcrumbs";
import LanguageMenu from "../ui/molecules/language-menu";
import { OnGitHubLink } from "./on-github";
import { Titlebar } from "../ui/molecules/titlebar";
import { TOC } from "./organisms/toc";
import { RenderSideBar } from "./organisms/sidebar";

import "./index.scss";

// Lazy sub-components
const Toolbar = lazy(() => import("./toolbar"));

export function Document(props /* TODO: define a TS interface for this */) {
  const documentURL = useDocumentURL();
  const { locale } = useParams();
  const navigate = useNavigate();

  const dataURL = `${documentURL}/index.json`;
  const { data: doc, error } = useSWR<Doc>(
    dataURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} on ${url}: ${text}`);
      }
      const { doc } = await response.json();
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
      revalidateOnFocus: false,
    }
  );

  useWebSocketMessageHandler((message) => {
    if (
      message.type === "DOCUMENT_CHANGE" &&
      message.change.document?.url === documentURL
    ) {
      mutate(dataURL);
    }
  });

  useEffect(() => {
    if (!doc && !error) {
      document.title = "⏳ Loading…";
    } else if (error) {
      document.title = "💔 Loading error";
    } else if (doc) {
      document.title = doc.pageTitle;
    }
  }, [doc, error]);

  if (!doc && !error) {
    return <LoadingDocumentPlaceholder />;
  }

  if (error) {
    // Was it because of a 404?
    if (
      typeof window !== "undefined" &&
      error instanceof Response &&
      error.status === 404
    ) {
      return <NoMatch />;
    } else {
      return <LoadingError error={error} />;
    }
  }

  if (!doc) {
    return null;
  }

  const translations = doc.other_translations || [];

  const isServer = typeof window === "undefined";

  return (
    <>
      <Titlebar docTitle={doc.title}>
        {!isServer && CRUD_MODE && !props.isPreview && !doc.isArchive && (
          <Suspense
            fallback={<p className="loading-toolbar">Loading toolbar</p>}
          >
            <Toolbar doc={doc} />
          </Suspense>
        )}
      </Titlebar>

      {doc.isArchive && <Archived doc={doc} />}

      <div className="breadcrumbs-locale-container">
        <div className="breadcrumb-container">
          {doc.parents && <Breadcrumbs parents={doc.parents} />}
        </div>

        <div className="locale-container">
          {translations && !!translations.length && (
            <LanguageMenu translations={translations} locale={locale} />
          )}
        </div>
      </div>

      <div className="page-content-container">
        {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}

        <main className="main-content" role="main">
          <article className="article">
            <RenderDocumentBody doc={doc} />

            <div className="metadata">
              <section className="document-meta">
                <header className="visually-hidden">
                  <h4>Metadata</h4>
                </header>
                <ul>
                  <li className="last-modified">
                    <LastModified value={doc.modified} locale={locale} />,{" "}
                    <a href={`${doc.mdn_url}/contributors.txt`}>
                      by MDN contributors
                    </a>
                  </li>
                </ul>
                {!doc.isArchive && <OnGitHubLink doc={doc} />}
              </section>
            </div>
          </article>
        </main>

        {doc.sidebarHTML && <RenderSideBar doc={doc} />}
      </div>
    </>
  );
}

function LoadingDocumentPlaceholder() {
  return (
    <>
      <Titlebar docTitle={"Loading…"} />

      <div className="breadcrumbs-locale-container">
        <div className="breadcrumb-container">
          <p>&nbsp;</p>
        </div>
      </div>
      <div className="page-content-container loading-document-placeholder">
        <main className="main-content" role="main">
          <article className="article">
            <p>
              <span role="img" aria-label="Hourglass">
                ⏳
              </span>{" "}
              Loading…
            </p>
          </article>
        </main>
      </div>
    </>
  );
}

function LastModified({ value, locale }) {
  if (!value) {
    return <span>Last modified date not known</span>;
  }
  const date = new Date(value);
  // Justification for these is to match historically
  const dateStringOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return (
    <>
      <b>Last modified:</b>{" "}
      <time dateTime={value}>
        {date.toLocaleString(locale, dateStringOptions)}
      </time>
    </>
  );
}

function Archived({ doc }: { doc: Doc }) {
  return (
    <div className={`archived ${doc.isTranslated ? "translated" : ""}`}>
      {doc.isTranslated ? (
        <p>
          <b>This is an archived translation.</b>{" "}
          <a
            href="https://blogpost.example.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            No more edits are being accepted.
          </a>
        </p>
      ) : (
        <p>
          <b>This is an archived page.</b> It's not actively maintained.
        </p>
      )}
    </div>
  );
}

/** These prose sections should be rendered WITHOUT a heading. */
const PROSE_NO_HEADING = ["short_description", "overview"];

function RenderDocumentBody({ doc }) {
  return doc.body.map((section, i) => {
    if (section.type === "prose") {
      // Only exceptional few should use the <Prose/> component,
      // as opposed to <ProseWithHeading/>.
      if (!section.value.id || PROSE_NO_HEADING.includes(section.value.id)) {
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
    } else if (section.type === "interactive_example") {
      return (
        <InteractiveExample
          key={section.value.url}
          url={section.value.url}
          height={section.value.height}
          title={doc.title}
        />
      );
    } else if (section.type === "attributes") {
      return <Attributes key={`attributes${i}`} attributes={section.value} />;
    } else if (section.type === "specifications") {
      return (
        <Specifications
          key={`specifications${i}`}
          specifications={section.value}
        />
      );
    } else if (section.type === "browser_compatibility") {
      return (
        <LazyBrowserCompatibilityTable
          key={`browser_compatibility${i}`}
          {...section.value}
        />
      );
    } else if (section.type === "examples") {
      return <Examples key={`examples${i}`} examples={section.value} />;
    } else if (section.type === "info_box") {
      // XXX Unfinished!
      // https://github.com/mdn/stumptown-content/issues/106
      console.warn("Don't know how to deal with info_box!");
      return null;
    } else if (
      section.type === "class_constructor" ||
      section.type === "static_methods" ||
      section.type === "instance_methods"
    ) {
      return (
        <LinkList
          key={`${section.type}${i}`}
          title={section.value.title}
          links={section.value.content}
        />
      );
    } else if (section.type === "link_lists") {
      return <LinkLists key={`linklists${i}`} lists={section.value} />;
    } else {
      console.warn(section);
      throw new Error(`No idea how to handle a '${section.type}' section`);
    }
  });
}

function LoadingError({ error }) {
  return (
    <div className="page-content-container loading-error">
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
        <a href=".">Try reloading the page</a>
      </p>
    </div>
  );
}
