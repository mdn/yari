import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import { SearchWidget } from "../../search";

import "./form.scss";

export type DocumentData = {
  rawHtml: string;
  metadata: { slug: string; title: string; summary: string };
};
export default function DocumentForm({
  onSave,
  initialSlug,
  doc,
  isSaving,
  savingError,
}: {
  onSave: (doc: DocumentData) => any;
  initialSlug?: string | null;
  doc?: DocumentData;
  isSaving?: boolean;
  savingError?: null | Error;
}) {
  const { locale } = useParams();

  const [slug, setSlug] = useState(
    initialSlug ? initialSlug + "/" : doc ? doc.metadata.slug + "/" : ""
  );
  const [slugExists, setSlugExists] = useState(false);
  const [title, setTitle] = useState(doc ? doc.metadata.title : "");
  const [summary, setSummary] = useState(doc ? doc.metadata.summary : "");
  const [rawHtml, setRawHtml] = useState(doc ? doc.rawHtml : "");
  const [autosaveEnabled, setAutoSaveEnabled] = useLocalStorage(
    "autosaveEdit",
    false
  );

  const isNew = !doc;

  // New documents should not autosave
  const shouldAutosave = !isNew && autosaveEnabled;

  // In auto-save mode inputs should still be changeable during saving
  const disableInputs = !shouldAutosave && isSaving;

  function toggleAutoSave() {
    setAutoSaveEnabled(!autosaveEnabled);
  }

  // skip over the /:locale/docs/ parts of the URL
  function setSlugFromURL(url: string) {
    setSlug(url.split("/").slice(3).join("/"));
  }

  const [putDocumentDebounced] = useDebouncedCallback(onSave, 1000);
  useEffect(() => {
    if (shouldAutosave) {
      putDocumentDebounced({ rawHtml, metadata: { slug, title, summary } });
    }
  }, [shouldAutosave, putDocumentDebounced, slug, title, summary, rawHtml]);

  return (
    <form
      className="document-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({ rawHtml, metadata: { slug, title, summary } });
      }}
    >
      {isNew && (
        <div>
          <label>
            URL
            <SearchWidget
              value={`/${locale}/docs/${slug}`}
              onChange={(url) => {
                setSlugFromURL(url);
              }}
              onValueExistsChange={(exists) => {
                setSlugExists(exists);
              }}
            />
          </label>
          {slugExists && (
            <div className="form-warning">
              Warning! This URL already exists, creating this document will
              override the other document using that URL.
            </div>
          )}
        </div>
      )}

      <p>
        <label>
          Title
          <input
            disabled={disableInputs}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            style={{ width: "100%" }}
          />
        </label>
      </p>

      <label>
        Summary
        <textarea
          disabled={disableInputs}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="Summary"
          rows={2}
          style={{ width: "100%" }}
        />
      </label>

      <textarea
        disabled={disableInputs}
        value={rawHtml}
        onChange={(event) => setRawHtml(event.target.value)}
        rows={30}
        style={{ width: "100%" }}
      />
      <p>
        <button
          type="submit"
          disabled={
            disableInputs || !title || (isNew && !slug) || !summary || !rawHtml
          }
        >
          {isNew ? "Create" : "Save"}
        </button>

        {!isNew && (
          <span className="action-options">
            <input
              type="checkbox"
              id="enable_autosave"
              checked={autosaveEnabled}
              onChange={toggleAutoSave}
            />
            <label htmlFor="enable_autosave">Enable autosave</label>
          </span>
        )}
      </p>
      {savingError && (
        <div className="error-message submission-error">
          <p>Error saving document</p>
          <pre>{savingError.toString()}</pre>
        </div>
      )}
    </form>
  );
}

/**
 * From https://usehooks.com/useLocalStorage/
 */
function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}
