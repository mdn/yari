import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import "./index.scss";

export type DocumentData = {
  html: string;
  meta: { slug: string; title: string; summary: string };
};
export default function DocumentForm({
  data,
  isNew,
  isSaving,
  savingError,
  onSave,
}: {
  data: Partial<Omit<DocumentData, "meta">> & {
    meta?: Partial<DocumentData["meta"]>;
  };
  onSave: (data: DocumentData) => any;
  isNew?: boolean;
  isSaving?: boolean;
  savingError?: null | Error;
}) {
  const defaults: DocumentData = {
    html: "",
    ...data,
    meta: { slug: "", title: "", summary: "", ...data.meta },
  };
  const [slug, setSlug] = useState(
    defaults.meta.slug ? defaults.meta.slug + "/" : ""
  );
  const [title, setTitle] = useState(defaults.meta.title);
  const [summary, setSummary] = useState(defaults.meta.summary);
  const [html, setHtml] = useState(defaults.html);
  const [autosaveEnabled, setAutoSaveEnabled] = useLocalStorage(
    "autosaveEdit",
    false
  );

  // New documents should not autosave
  const shouldAutosave = !isNew && autosaveEnabled;

  // In auto-save mode inputs should still be changeable during saving
  const disableInputs = !shouldAutosave && isSaving;

  function toggleAutoSave() {
    setAutoSaveEnabled(!autosaveEnabled);
  }

  const [putDocumentDebounced] = useDebouncedCallback(onSave, 1000);

  useEffect(() => {
    if (shouldAutosave) {
      putDocumentDebounced({ html, meta: { slug, title, summary } });
    }
  }, [shouldAutosave, putDocumentDebounced, slug, title, summary, html]);

  return (
    <form
      className="document-form"
      onSubmit={function (event) {
        event.preventDefault();
        onSave({ html, meta: { slug, title, summary } });
      }}
    >
      {isNew && (
        <p>
          <label>
            Slug
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </p>
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
        value={html}
        onChange={(event) => setHtml(event.target.value)}
        rows={30}
        style={{ width: "100%" }}
      />
      <p>
        <button
          type="submit"
          disabled={
            disableInputs || !title || (isNew && !slug) || !summary || !html
          }
        >
          Save
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
