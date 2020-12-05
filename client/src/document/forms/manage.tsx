import { useDocumentURL } from "../hooks";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import useSWR from "swr";

import "./manage.scss";

function DocumentDelete({ slug, locale }) {
  async function deleteDocument() {
    if (
      !window.confirm(
        "Are you sure you want to delete this document and all its children?"
      )
    ) {
      return;
    }
    const response = await fetch(
      `/_document?slug=${encodeURIComponent(slug || "")}&locale=${locale}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (response.ok) {
      window.alert("Document successfully deleted");
    } else {
      window.alert(`Error while deleting document: ${response.statusText}`);
    }
  }

  return (
    <div>
      <button type="button" onClick={deleteDocument}>
        delete
      </button>
      {slug} and all of its children
    </div>
  );
}

function DocumentMove({ slug, locale }) {
  async function moveDocument() {
    const newSlug = window.prompt(
      "Are you sure you want to move this document and all its children?"
    );
    if (!newSlug) {
      return;
    }
    const response = await fetch(
      `/_document/move?slug=${encodeURIComponent(
        slug || ""
      )}&newSlug=${newSlug}&locale=${locale}`,
      {
        method: "put",
      }
    );
    if (response.ok) {
      window.alert("Document successfully moved");
    } else {
      window.alert(`Error while deleting document: ${response.statusText}`);
    }
  }

  return (
    <div>
      <button type="button" onClick={moveDocument}>
        move
      </button>
      {slug} and all of its children
    </div>
  );
}

export default function DocumentManage() {
  const documentURL = useDocumentURL();
  const { locale } = useParams();
  const fetchURL = `/_document?${new URLSearchParams({
    url: documentURL,
  }).toString()}`;
  const { data } = useSWR(fetchURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${url}`);
    }
    return await response.json();
  });

  return (
    (data && (
      <main className="page-content-container document-manage" role="main">
        <h2>
          Manage {data.metadata.slug}
          <Link to={documentURL} className="close">
            close
          </Link>
        </h2>
        <DocumentDelete {...{ slug: data.metadata.slug, locale }} />
        <DocumentMove {...{ slug: data.metadata.slug, locale }} />
      </main>
    )) || (
      <main className="page-content-container document-manage" role="main">
        {" "}
        Loading …{" "}
      </main>
    )
  );
}
