import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { Document } from "../index";
import { useDocumentURL } from "../hooks";
import DocumentForm, { DocumentOutData } from "./form";

import "./edit.scss";

export default function DocumentEdit() {
  const location = useLocation();
  const navigate = useNavigate();
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
        setSavingError(new Error(`${response.status} on ${documentURL}`));
        return;
      }
      if (didSlugChange) {
        navigate(
          location.pathname.split("_edit")[0] + "_edit/" + data.metadata.slug,
          { replace: true }
        );
      }
    } catch (err) {
      setSavingError(err);
    }
    setIsSaving(false);
  }

  return (
    <div className="document-edit">
      <h2>
        Edit view
        <Link to={documentURL} className="close">
          close
        </Link>
      </h2>

      {!data && !error && <p>Loading source data...</p>}
      {error && (
        <div>
          <h3>Error loading source</h3>
          <code>{error.toString()}</code>
        </div>
      )}
      {data && (
        <DocumentForm
          doc={data}
          {...{ isSaving, savingError }}
          onSave={handleSave}
        />
      )}
      <Document />
    </div>
  );
}
