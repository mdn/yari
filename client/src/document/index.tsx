import React, { lazy, Suspense, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useSWR, { mutate } from "swr";

import { CRUD_MODE } from "../constants";
import { useWebSocketMessageHandler } from "../web-socket";
import { NoMatch } from "../routing";
import { useDocumentURL } from "./hooks";
import { Doc, DocParent } from "./types";
// Ingredients
import { Prose, ProseWithHeading } from "./ingredients/prose";
import { InteractiveExample } from "./ingredients/interactive-example";
import { Attributes } from "./ingredients/attributes";
import { Examples } from "./ingredients/examples";
import { LinkList, LinkLists } from "./ingredients/link-lists";
import { Specifications } from "./ingredients/specifications";
import { BrowserCompatibilityTable } from "./ingredients/browser-compatibility-table";
// Misc
// Sub-components
import { DocumentTranslations } from "./languages";
import { TOC } from "./toc";

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
    if (doc) {
      document.title = doc.pageTitle;
    }
  }, [doc]);

  if (!doc && !error) {
    return <p>Loading...</p>;
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

  const translations = [...(doc.other_translations || [])];
  if (doc.translation_of) {
    translations.unshift({
      locale: "en-US",
      slug: doc.translation_of,
    });
  }

  const { github_url, folder } = doc.source;

  const isServer = typeof window === "undefined";

  return (
    <main>
      {doc.isArchive && <Archived doc={doc} />}
      {!isServer && CRUD_MODE && !doc.isArchive && (
        <Suspense fallback={<p className="loading-toolbar">Loading toolbar</p>}>
          <Toolbar doc={doc} />
        </Suspense>
      )}
      <header className="documentation-page-header">
        <div className="titlebar-container">
          <div className="titlebar">
            <h1 className="title">{doc.title}</h1>
          </div>
        </div>
        <div className="full-width-row-container">
          <div className="max-content-width-container">
            <nav className="breadcrumbs" role="navigation">
              {doc.parents && <Breadcrumbs parents={doc.parents} />}
            </nav>

            {translations && !!translations.length && (
              <DocumentTranslations translations={translations} />
            )}
          </div>
        </div>
      </header>

      <div
        className={
          (doc.toc && doc.toc.length) || doc.sidebarHTML
            ? "wiki-left-present content-layout"
            : "content-layout"
        }
      >
        {doc.toc && !!doc.toc.length && <TOC toc={doc.toc} />}

        <div id="content" className="article text-content">
          <article id="wikiArticle">
            <RenderDocumentBody doc={doc} />
          </article>

          <div className="metadata">
            <section className="document-meta">
              <header className="visually-hidden">
                <h4>Metadata</h4>
              </header>
              <ul>
                <li className="last-modified">
                  <LastModified value={doc.modified} locale={locale} />
                </li>
                {!doc.isArchive && (
                  <li className="edit-on-github">
                    <a
                      href={github_url}
                      title={`Folder: ${folder}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Edit on <b>GitHub</b>
                    </a>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>

        {doc.sidebarHTML && (
          <div id="sidebar-quicklinks" className="sidebar">
            <RenderSideBar doc={doc} />
          </div>
        )}
      </div>
    </main>
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

// XXX Move this component to its own file. index.tsx is already too large.
function Breadcrumbs({ parents }: { parents: DocParent[] }) {
  if (!parents.length) {
    throw new Error("Empty parents array");
  }
  return (
    <ol
      typeof="BreadcrumbList"
      vocab="https://schema.org/"
      aria-label="breadcrumbs"
    >
      {parents.map((parent, i) => {
        const isLast = i + 1 === parents.length;
        return (
          <li key={parent.uri} property="itemListElement" typeof="ListItem">
            <Link
              to={parent.uri}
              className={isLast ? "crumb-current-page" : "breadcrumb-chevron"}
              property="item"
              typeof="WebPage"
            >
              <span property="name">{parent.title}</span>
            </Link>
            <meta property="position" content={`${i + 1}`} />
          </li>
        );
      })}
    </ol>
  );
}

function RenderSideBar({ doc }) {
  if (!doc.related_content) {
    if (doc.sidebarHTML) {
      return <div dangerouslySetInnerHTML={{ __html: doc.sidebarHTML }} />;
    }
    return null;
  }
  return doc.related_content.map((node) => (
    <SidebarLeaf key={node.title} parent={node} />
  ));
}

function SidebarLeaf({ parent }) {
  return (
    <div>
      <h3>{parent.title}</h3>
      <ul>
        {parent.content.map((node) => {
          if (node.content) {
            return (
              <li key={node.title}>
                <SidebarLeaflets node={node} />
              </li>
            );
          } else {
            return (
              <li key={node.uri}>
                <Link to={node.uri}>{node.title}</Link>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}

function SidebarLeaflets({ node }) {
  return (
    <details open={node.open}>
      <summary>
        {node.uri ? <Link to={node.uri}>{node.title}</Link> : node.title}
      </summary>
      <ol>
        {node.content.map((childNode) => {
          if (childNode.content) {
            return (
              <li key={childNode.title}>
                <SidebarLeaflets node={childNode} />
              </li>
            );
          } else {
            return (
              <li
                key={childNode.uri}
                className={childNode.isActive && "active"}
              >
                <Link to={childNode.uri}>{childNode.title}</Link>
              </li>
            );
          }
        })}
      </ol>
    </details>
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
        <BrowserCompatibilityTable
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

// function Contributors({ contributors }) {
//   return (
//     <div>
//       <b>Contributors to this page:</b>
//       <span dangerouslySetInnerHTML={{ __html: contributors }} />
//     </div>
//   );
// }

function LoadingError({ error }) {
  return (
    <div className="loading-error">
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
