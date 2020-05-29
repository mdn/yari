import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import DocumentForm, { DocumentOutData } from "./form";

export default function DocumentCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [savingError, setSavingError] = useState<Error | null>(null);

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
      navigate(`/${data.metadata.locale}/docs/${data.metadata.slug}`);
    } catch (err) {
      setSavingError(err);
    }
  }

  return (
    <DocumentForm
      initialSlug={new URLSearchParams(location.search).get("initial_slug")}
      onSave={handleCreate}
      savingError={savingError}
    />
  );
}
