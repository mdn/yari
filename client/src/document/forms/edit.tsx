import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useSWR from "swr";
import { Document } from "../index";
import { useDocumentURL } from "../hooks";
import { DocumentForm, DocumentOutData } from "./form";

import "./edit.scss";

export default function DocumentEdit() {
  const location = useLocation();
  const documentURL = useDocumentURL();
  const fetchURL = `/_document?${new URLSearchParams({
    url: documentURL,
  }).toString()}`;
  const { data, error } = useSWR(fetchURL, async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${response.status} on ${url}`);
    }
    return await response.json();
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savingError, setSavingError] = useState<Error | null>(null);
  async function handleSave(data: DocumentOutData, didSlugChange: boolean) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/_document?url=${encodeURIComponent(documentURL)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        setSavingError(new Error(`${response.status} on ${response.url}`));
        return;
      }
      if (didSlugChange) {
        // Hack! We do a full-page transition so that the search index refreshes itself
        window.location.href =
          location.pathname.split("_edit")[0] + "_edit/" + data.metadata.slug;
      }
    } catch (err) {
      setSavingError(err);
    }
    setIsSaving(false);
  }

  return (
    <main className="page-content-container document-edit" role="main">
      <h2 className="edit-header">
        Edit view
        <Link to={documentURL} className="close">
          close
        </Link>
      </h2>

      {!data && !error && <p>Loading source data...</p>}
      {error && (
        <div className="attention">
          <h3>Error loading source</h3>
          <code>{error.toString()}</code>
        </div>
      )}
      <div className="document-edit-forms">
        {data && (
          <DocumentForm
            doc={data}
            {...{ isSaving, savingError }}
            onSave={handleSave}
          />
        )}
      </div>
      <div className="document-preview">
        <Document isPreview={true} />
      </div>
    </main>
  );
}
