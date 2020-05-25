import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import DocumentForm, { DocumentData } from "./index";

export default function DocumentCreate() {
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
      navigate(`/${locale}/docs/${data.meta.slug}`);
    } catch (err) {
      setSavingError(err);
    }
  }

  return <DocumentForm onSave={handleCreate} savingError={savingError} />;
}
