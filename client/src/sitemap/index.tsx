import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useSWR from "swr";
import { useLocale } from "../hooks";
import { PageContentContainer } from "../ui/atoms/page-content";

import "./index.scss";

interface SearchIndexDoc {
  url: string;
  title: string;
}

export default function Sitemap() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const locale = useLocale();
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

  React.useEffect(() => {
    if (searchSubmitted) {
      if (filtered && filtered.length >= 1) {
        const slug = filtered[0].url.split("/").slice(3);
        setSearchFilter("");
        setSearchSubmitted(false);
        navigate(`/${locale}/_sitemap/${slug.join("/")}`);
      }
    }
  }, [locale, filtered, searchSubmitted, navigate]);

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
        {!data && !error && <p>Loading loading loading...</p>}
        {filtered && <Breadcrumb pathname={pathname} />}
        <p className="this-doc">
          {thisDoc ? (
            <b>
              Go to: <Link to={thisDoc.url}>{thisDoc.title}</Link>
            </b>
          ) : (
            <b>
              Go to: <Link to={`/${locale}/`}>Home page</Link>
            </b>
          )}
        </p>
        {filtered && (
          <FilterForm
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
          />
        )}
        {filtered && <ShowTree filtered={filtered} childCounts={childCounts} />}
        <p className="footer-note">
          Note, this sitemap only shows documents. Not any other applications.
        </p>
      </div>
    </PageContentContainer>
  );
}

function FilterForm({
  searchFilter,
  onUpdate,
  onGoUp,
}: {
  searchFilter: string;
  onUpdate: (text: string, submitted: boolean) => void;
  onGoUp: () => void;
}) {
  const [countBackspaces, setCountBackspaces] = React.useState(0);
  React.useEffect(() => {
    if (countBackspaces >= 2) {
      onGoUp();
    }
  }, [countBackspaces]);
  const inputRef = React.useRef<null | HTMLInputElement>(null);
  function focusSearch(event: KeyboardEvent) {
    if (inputRef.current && event.target) {
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (event.key === "Backspace" && event.target === inputRef.current) {
          setCountBackspaces((s) => s + 1);
        } else {
          setCountBackspaces(0);
        }

        if (event.key === "Escape") {
          inputRef.current.blur();
        }
      } else {
        if (event.key === "T" || event.key === "t") {
          inputRef.current.focus();
          const tipElement = document.querySelector(
            ".filter-form .keyboard-tip"
          );
          if (tipElement) {
            tipElement.parentNode?.removeChild(tipElement);
          }
          setCountBackspaces(0);
        }
      }
    }
  }
  React.useEffect(() => {
    window.document.addEventListener("keyup", focusSearch);
    return () => {
      window.document.removeEventListener("keyup", focusSearch);
    };
  }, []);
  const { pathname } = useLocation();
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
      />{" "}
      <small className="keyboard-tip">
        Tip! press <kbd>t</kbd> on your keyboard to focus on search filter
      </small>
    </form>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const split = pathname.split("/").slice(3);
  const root = pathname.split("/").slice(0, 2);
  root.push("_sitemap");

  return (
    <ul className="breadcrumb">
      <li>
        <Link to={root.join("/")}>root</Link>
      </li>
      {split.map((portion, i) => {
        const last = i === split.length - 1;
        root.push(portion);
        return (
          <li key={`${portion}${i}`} className={last ? "last" : undefined}>
            {last ? (
              <em>{portion}</em>
            ) : (
              <Link to={root.join("/")}>{portion}</Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ShowTree({
  filtered,
  childCounts,
}: {
  filtered: SearchIndexDoc[];
  childCounts: Map<string, number>;
}) {
  const locale = useLocale();
  if (filtered.length === 0) {
    return (
      <p>
        <em>Nothing here</em>
      </p>
    );
  }
  return (
    <div className="tree">
      <ul>
        {filtered.map((doc) => {
          return (
            <li key={doc.url}>
              <Link to={doc.url.replace("/docs/", "/_sitemap/")}>
                <code>{doc.url.replace(`/${locale}/docs`, "")}</code>
              </Link>{" "}
              {childCounts.get(doc.url) && (
                <small>({childCounts.get(doc.url)})</small>
              )}
              {/* <Link to={doc.url} title={`Go to: ${doc.title}`}>
                Go to this doc
              </Link> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
