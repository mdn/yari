import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useSWR from "swr";

import { CRUD_MODE, CRUD_MODE_HOSTNAMES } from "../constants";
import { useLocale } from "../hooks";
import { Loading } from "../ui/atoms/loading";
import { PageContentContainer } from "../ui/atoms/page-content";

import "./index.scss";

interface SearchIndexDoc {
  url: string;
  title: string;
}

export default function Sitemap() {
  const location = useLocation();
  const navigate = useNavigate();
  const locale = useLocale();

  // Because you can load this app with something like `/en-us/_sitemap/Web/`
  // we have to pretend that didn't happen and force it to be `/en-US/_sitemap/Web`
  const pathname = location.pathname.endsWith("/")
    ? location.pathname.slice(0, -1)
    : location.pathname;

  // `pathname` is going to be something like `/en-US/_sitemap/Web/Foo`.
  // Transform that to be just `en-us/docs/web/foo`.
  const searchPathname = pathname
    .replace(`/${locale}/_sitemap`, `/${locale}/docs`)
    .toLowerCase();

  React.useEffect(() => {
    document.title = "Sitemap";
  }, []);

  const { data, error } = useSWR<SearchIndexDoc[] | null, Error | null>(
    `/${locale}/search-index.json`,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${response.url}`);
      }
      return (await response.json()) as SearchIndexDoc[];
    },
    {
      revalidateOnFocus: false,
    }
  );

  const [docs, setDocs] = React.useState<SearchIndexDoc[] | null>(null);
  React.useEffect(() => {
    if (data) {
      const theseDocs = [...data].sort((a, b) => a.url.localeCompare(b.url));
      setDocs(theseDocs);
    }
  }, [data]);

  const [childCounts, setChildCounts] = React.useState<Map<string, number>>(
    new Map()
  );
  React.useEffect(() => {
    const counts = new Map<string, number>();
    if (docs) {
      for (const { url } of docs) {
        const split = url.split("/");
        const root = split.slice(0, 3);
        split.slice(3).forEach((portion, i) => {
          root.push(portion);
          const key = root.join("/");
          counts.set(key, (counts.get(key) || 0) + 1);
        });
      }
      setChildCounts(counts);
    }
  }, [docs]);

  const [thisDoc, setThisDoc] = React.useState<SearchIndexDoc | null>(null);
  React.useEffect(() => {
    if (docs) {
      const newThisDoc = docs.find((doc) => {
        return doc.url.toLowerCase() === searchPathname;
      });
      setThisDoc(newThisDoc || null);
    }
  }, [searchPathname, docs]);

  const [searchFilter, setSearchFilter] = React.useState("");
  React.useEffect(() => {
    setSearchFilter("");
  }, [pathname]);
  const [searchSubmitted, setSearchSubmitted] = React.useState(false);

  const [filtered, setFiltered] = React.useState<SearchIndexDoc[] | null>(null);
  React.useEffect(() => {
    if (docs) {
      const depth = searchPathname.split("/").length;
      const newFiltered = docs.filter((doc) => {
        if (
          doc.url.toLowerCase().startsWith(searchPathname) &&
          depth + 1 === doc.url.split("/").length
        ) {
          const baseName = doc.url.split("/").slice(-1)[0].toLowerCase();
          if (!baseName.startsWith(searchFilter.toLowerCase())) {
            return false;
          }
          return true;
        }
        return false;
      });
      setFiltered(newFiltered);
    }
  }, [searchPathname, docs, searchFilter]);

  const [highlightIndex, setHighlightIndex] = React.useState(0);
  React.useEffect(() => {
    setHighlightIndex(0);
  }, [searchFilter]);

  React.useEffect(() => {
    if (searchSubmitted) {
      if (filtered && filtered.length >= 1) {
        const slug = filtered[highlightIndex].url.split("/").slice(3);
        setSearchFilter("");
        setSearchSubmitted(false);
        navigate(`/${locale}/_sitemap/${slug.join("/")}`);
      }
    }
  }, [locale, filtered, searchSubmitted, navigate, highlightIndex]);

  function changeHighlight(direction: "up" | "down") {
    if (direction === "up") {
      let nextNumber = highlightIndex - 1;
      if (filtered) {
        nextNumber =
          ((nextNumber % filtered.length) + filtered.length) % filtered.length;
      }
      setHighlightIndex(nextNumber);
    } else {
      let nextNumber = highlightIndex + 1;
      if (filtered) {
        nextNumber = nextNumber % filtered.length;
      }
      setHighlightIndex(nextNumber);
    }
  }

  const [opening, setOpening] = React.useState<string | null>(null);
  const [editorOpeningError, setEditorOpeningError] =
    React.useState<Error | null>(null);
  React.useEffect(() => {
    let unsetOpeningTimer: ReturnType<typeof setTimeout>;
    if (opening) {
      unsetOpeningTimer = setTimeout(() => {
        setOpening(null);
      }, 3000);
    }
    return () => {
      if (unsetOpeningTimer) {
        clearTimeout(unsetOpeningTimer);
      }
    };
  }, [opening]);

  async function openInYourEditor(url: string) {
    console.log(`Going to try to open ${url} in your editor`);
    setOpening(url);
    const sp = new URLSearchParams();
    sp.set("url", url);
    try {
      const response = await fetch(`/_open?${sp.toString()}`);
      if (!response.ok) {
        if (response.status >= 500) {
          setEditorOpeningError(
            new Error(`${response.status}: ${response.statusText}`)
          );
        } else {
          const body = await response.text();
          setEditorOpeningError(new Error(`${response.status}: ${body}`));
        }
      }
    } catch (err) {
      setEditorOpeningError(err);
    }
  }

  return (
    <PageContentContainer>
      <div id="sitemap">
        {error && (
          <div className="notecard error">
            <h4>Error</h4>
            <p>
              <code>{error.toString()}</code>
            </p>
          </div>
        )}

        {editorOpeningError && (
          <div className="notecard error">
            <h4>Error opening in your editor</h4>
            <p>
              <code>{editorOpeningError.toString()}</code>
            </p>
          </div>
        )}

        {!data && !error && <Loading />}
        <div className="opening-in-your-editor">
          {opening && (
            <>
              Opening{" "}
              <code>{opening.slice(opening.length - 50, opening.length)}</code>{" "}
              in your editor...
            </>
          )}
        </div>
        {filtered && (
          <Breadcrumb
            pathname={pathname}
            thisDoc={thisDoc}
            openInYourEditor={openInYourEditor}
          />
        )}
        {filtered && (
          <FilterForm
            pathname={pathname}
            searchFilter={searchFilter}
            onUpdate={(text: string, submitted: boolean) => {
              setSearchFilter(text);
              setSearchSubmitted(submitted);
            }}
            onGoUp={() => {
              // Navigate to the parent! ...if possible
              const split = pathname.split("/");
              if (split.length >= 4) {
                const parentPathname = split.slice(0, -1);
                navigate(parentPathname.join("/"));
              }
            }}
            onChangeHighlight={changeHighlight}
          />
        )}
        {filtered &&
          filtered.length === 0 &&
          (searchFilter ? (
            <em>nothing found</em>
          ) : (
            <em>has no further sub-documents</em>
          ))}
        {filtered && !searchFilter && <GoBackUp pathname={pathname} />}
        {filtered && filtered.length > 0 && (
          <ShowTree
            filtered={filtered}
            childCounts={childCounts}
            highlightIndex={highlightIndex}
            openInYourEditor={openInYourEditor}
          />
        )}
        <p className="footer-note">
          Note, this sitemap only shows documents. Not any other applications.
        </p>
      </div>
    </PageContentContainer>
  );
}

function GoBackUp({ pathname }: { pathname: string }) {
  const parentPath = pathname.split("/").slice(0, -1);
  if (parentPath.length <= 2) {
    return null;
  }
  const parentBasename = parentPath[parentPath.length - 1];

  return (
    <p>
      <Link to={parentPath.join("/")}>
        ↖️ Back up to{" "}
        {parentPath.length <= 3 ? <em>root</em> : <code>{parentBasename}</code>}
      </Link>
    </p>
  );
}

function FilterForm({
  pathname,
  searchFilter,
  onUpdate,
  onGoUp,
  onChangeHighlight,
}: {
  pathname: string;
  searchFilter: string;
  onUpdate: (text: string, submitted: boolean) => void;
  onGoUp: () => void;
  onChangeHighlight: (s: "up" | "down") => void;
}) {
  const [hideTip, setHideTip] = React.useState(false);

  const [countBackspaces, setCountBackspaces] = React.useState(0);
  React.useEffect(() => {
    if (countBackspaces >= 2) {
      setCountBackspaces(0);
      onGoUp();
    }
  }, [countBackspaces, onGoUp]);

  const inputRef = React.useRef<null | HTMLInputElement>(null);

  const focusSearch = React.useCallback(
    (event: KeyboardEvent) => {
      if (inputRef.current && event.target) {
        const target = event.target as HTMLElement;

        if (target === inputRef.current) {
          if (event.key === "ArrowDown") {
            onChangeHighlight("down");
          } else if (event.key === "ArrowUp") {
            onChangeHighlight("up");
          }
        }

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          if (event.key === "Backspace" && event.target === inputRef.current) {
            if (!searchFilter.trim()) {
              setCountBackspaces((s) => s + 1);
            }
          } else {
            setCountBackspaces(0);
          }

          if (event.key === "Escape") {
            inputRef.current.blur();
          }
        } else {
          if (event.key === "T" || event.key === "t") {
            inputRef.current.focus();
            setCountBackspaces(0);
          }
        }
      }
    },
    [onChangeHighlight, searchFilter]
  );

  React.useEffect(() => {
    window.document.addEventListener("keyup", focusSearch);
    return () => {
      window.document.removeEventListener("keyup", focusSearch);
    };
  }, [focusSearch]);
  const prefixPathname = pathname.replace(`/_sitemap`, "/docs");

  return (
    <form
      className="filter-form"
      onSubmit={(event) => {
        event.preventDefault();
        onUpdate(searchFilter.trim(), true);
      }}
    >
      <code>{prefixPathname}</code>/
      <input
        type="search"
        ref={inputRef}
        value={searchFilter}
        onChange={(event) => {
          onUpdate(event.target.value, false);
        }}
        onFocus={() => {
          setHideTip(true);
        }}
        onBlur={() => {
          setHideTip(false);
        }}
      />{" "}
      {!hideTip && (
        <small className="keyboard-tip">
          Tip! press <kbd>t</kbd> on your keyboard to focus on search filter
        </small>
      )}
    </form>
  );
}

function Breadcrumb({
  pathname,
  thisDoc,
  openInYourEditor,
}: {
  pathname: string;
  thisDoc: SearchIndexDoc | null;
  openInYourEditor: (url: string) => void;
}) {
  const locale = useLocale();
  const split = pathname.split("/").slice(3);
  const root = pathname.split("/").slice(0, 2);
  root.push("_sitemap");

  const isReadOnly = !CRUD_MODE_HOSTNAMES.includes(window.location.hostname);

  return (
    <>
      <ul className="breadcrumb">
        <li className="first">
          {split.length ? <Link to={root.join("/")}>root</Link> : <em>root</em>}
        </li>
        {split.map((portion, i) => {
          const last = i === split.length - 1;
          root.push(portion);
          return (
            <li key={`${portion}${i}`} className={last ? "last" : undefined}>
              {last ? (
                <code>{portion}</code>
              ) : (
                <Link to={root.join("/")}>
                  <code>{portion}</code>
                </Link>
              )}
            </li>
          );
        })}
        <li className="this-doc">
          <b>Go to:</b>{" "}
          {thisDoc ? (
            <>
              <Link to={thisDoc.url}>
                <em>{thisDoc.title}</em>
              </Link>{" "}
              {CRUD_MODE && !isReadOnly && (
                <small>
                  (
                  <a
                    href={thisDoc.url}
                    role="img"
                    aria-label="Editor pen"
                    onClick={(event) => {
                      event.preventDefault();
                      openInYourEditor(thisDoc.url);
                    }}
                    title="Open in your editor"
                  >
                    Edit
                  </a>
                  )
                </small>
              )}
            </>
          ) : (
            <Link to={`/${locale}/`}>Home page</Link>
          )}
        </li>
      </ul>
    </>
  );
}

function ShowTree({
  filtered,
  childCounts,
  highlightIndex,
  openInYourEditor,
}: {
  filtered: SearchIndexDoc[];
  childCounts: Map<string, number>;
  highlightIndex: number;
  openInYourEditor: (url: string) => void;
}) {
  const locale = useLocale();
  const isReadOnly = !CRUD_MODE_HOSTNAMES.includes(window.location.hostname);
  return (
    <div className="tree">
      <ul>
        {filtered.map((doc, i) => {
          const countChild = childCounts.get(doc.url) || 0;
          return (
            <li
              key={doc.url}
              className={highlightIndex === i ? "highlight" : undefined}
            >
              <Link
                to={doc.url.replace("/docs/", "/_sitemap/")}
                title={doc.title}
              >
                <code>{doc.url.replace(`/${locale}/docs`, "")}</code>
              </Link>{" "}
              <small>
                (
                {countChild === 1
                  ? "1 document"
                  : `${countChild.toLocaleString()} documents`}
                {" | "}
                <Link to={doc.url} title={`Go to: ${doc.title}`}>
                  View
                </Link>
                {!isReadOnly && " | "}
                {!isReadOnly && (
                  <Link
                    to={doc.url}
                    title={`Edit: ${doc.title}`}
                    onClick={(event) => {
                      event.preventDefault();
                      openInYourEditor(doc.url);
                    }}
                  >
                    Edit
                  </Link>
                )}
                )
              </small>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
