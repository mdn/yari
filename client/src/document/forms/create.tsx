import React, { useState } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { useDocumentURL } from "../hooks";
import { DocumentForm, DocumentOutData } from "./form";
import "./create.scss";

export default function DocumentCreate() {
  const location = useLocation();
  const [savingError, setSavingError] = useState<Error | null>(null);
  const documentURL = useDocumentURL();

  async function handleCreate(data: DocumentOutData) {
    try {
      const response = await fetch(`/_document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        setSavingError(
          new Error(`${response.status}: ${await response.text()}`)
        );
        return;
      }
      // Hack! We do a full-page transition so that the search index refreshes itself
      window.location.href = `/${data.metadata.locale}/docs/${data.metadata.slug}`;
    } catch (err) {
      setSavingError(err);
    }
  }

  return (
    <main className="page-content-container document-create" role="main">
      <h2>
        Create new Document
        <Link to={documentURL} className="close">
          close
        </Link>
      </h2>
      <DocumentForm
        initialSlug={new URLSearchParams(location.search).get("initial_slug")}
        onSave={handleCreate}
        savingError={savingError}
      />
    </main>
  );
}
