import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router";
import DocumentForm, { DocumentData } from "./form";

export default function DocumentCreate() {
  const location = useLocation();
  const { locale } = useParams();
  const navigate = useNavigate();
  const [savingError, setSavingError] = useState<Error | null>(null);

  async function handleCreate(data: DocumentData) {
    try {
      const response = await fetch(`/_document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, ...data }),
      });
      if (!response.ok) {
        setSavingError(
          new Error(`${response.status}: ${await response.text()}`)
        );
        return;
      }
      navigate(`/${locale}/docs/${data.metadata.slug}`);
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
