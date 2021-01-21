import React from "react";
import { Link, useParams } from "react-router-dom";
import useSWR from "swr";

import "./git-documents.scss";

type Entry = {
  url: string;
  title: string;
  stats: string;
};

interface Data {
  diffDocuments: Entry[];
  diffDocumentsCount: number;
  diffStats: string;
  currentBranch: string;
}

export default function GitDocuments() {
  const { locale } = useParams();

  const getAPIUrl = React.useCallback(() => {
    const params = new URLSearchParams();
    params.set("locale", locale || "en-US");
    return `/_git?${params.toString()}`;
  }, [locale]);

  const { data, error, isValidating } = useSWR<Data, Error>(
    getAPIUrl(),
    async (url) => {
      let response;
      try {
        response = await fetch(url);
      } catch (ex) {
        throw ex;
      }
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      if (!response.headers.get("content-type").includes("application/json")) {
        throw new Error(
          `Response is not JSON (${response.headers.get("content-type")})`
        );
      }
      return response.json();
    }
  );

  return (
    <article id="git-documents" aria-labelledby="git-documents">
      <h2>
        <code>git</code> documents{" "}
        <span className="in-locale muted">
          (in <code>{locale || "en-US"}</code>)
        </span>
      </h2>
      <p className="is-loading">
        {isValidating ? "Loading git documents..." : ""}
      </p>

      {error && (
        <Banner>
          <b>Server error!</b> <code>{error.toString()}</code>
        </Banner>
      )}

      {data && !error && data.diffDocuments.length ? (
        <table className="compact">
          <thead>
            <tr>
              <th>Document</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>
            {data.diffDocuments.map((document) => {
              return (
                <tr key={document.url}>
                  <td>
                    <Link to={document.url}>
                      {document.title} <small>{document.url}</small>
                    </Link>
                  </td>
                  <td>
                    <DiffStat stats={document.stats} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div>
          <Banner>
            No documents found in the <code>git diff</code>. Perhaps it only
            contains changes to other types of files.
          </Banner>

          {data && data.diffStats && <pre>{data.diffStats}</pre>}
        </div>
      )}
      {data &&
        data.diffDocuments &&
        data.diffDocuments.length > 0 &&
        data.diffDocumentsCount > data.diffDocuments.length && (
          <Banner>
            Only showing the first {data.diffDocuments.length} but there are{" "}
            <b>{data.diffDocumentsCount.toLocaleString()} files</b> in total!
          </Banner>
        )}

      {data && (
        <Banner>
          Current branch: <code>{data.currentBranch}</code>
        </Banner>
      )}
    </article>
  );
}
function DiffStat({
  stats,
  maxWidth = 50,
}: {
  stats: string;
  maxWidth?: number;
}) {
  const [count, changes] = stats.split(" ");
  const inserts = changes ? (changes.match(/\+/g) || []).length : 0;
  const deletions = changes ? (changes.match(/-/g) || []).length : 0;
  return (
    <>
      {count}{" "}
      {inserts > 0 && (
        <ins title="Insertions">{"+".repeat(Math.min(inserts, maxWidth))}</ins>
      )}
      {inserts > maxWidth && <ins title="Too many to fit">…</ins>}
      {deletions > 0 && (
        <del title="Deletions">{"-".repeat(Math.min(deletions, maxWidth))}</del>
      )}
      {deletions > maxWidth && <del title="Too many to fit">…</del>}
    </>
  );
}

function Banner({ children }) {
  return <p className="notification">{children}</p>;
}
