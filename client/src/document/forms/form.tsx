import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import "./form.scss";

type DocumentFormData = {
  rawHTML: string;
  metadata: { title: string; slug: string };
};

// Same as DocumentFormData but metadata also includes the locale
export type DocumentOutData = DocumentFormData & {
  metadata: DocumentFormData["metadata"] & { locale: string };
};

export function DocumentForm({
  onSave,
  doc,
  isSaving,
  savingError,
}: {
  onSave: (doc: DocumentOutData) => unknown;
  doc: DocumentFormData;
  isSaving?: boolean;
  savingError?: null | Error;
}) {
  const { locale } = useParams();

  const [title, setTitle] = useState(doc ? doc.metadata.title : "");
  const [rawHTML, setRawHtml] = useState(doc ? doc.rawHTML : "");

  const [autosaveEnabled, setAutoSaveEnabled] = useLocalStorage(
    "autosaveEdit",
    false
  );

  const isNew = !doc;

  const willAutosave = autosaveEnabled;

  // In auto-save mode inputs should still be changeable during saving
  const disableInputs = !willAutosave && isSaving;

  function toggleAutoSave() {
    setAutoSaveEnabled(!autosaveEnabled);
  }

  const { callback: debounceCallback } = useDebouncedCallback(onSave, 1000);

  useEffect(() => {
    if (willAutosave) {
      debounceCallback({
        rawHTML,
        metadata: { title, locale, slug: doc.metadata.slug },
      });
    }
  }, [willAutosave, debounceCallback, title, rawHTML, locale]);

  return (
    <form
      className="document-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          rawHTML,
          metadata: { title, locale, slug: doc.metadata.slug },
        });
      }}
    >
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

      <textarea
        disabled={disableInputs}
        value={rawHTML}
        onChange={(event) => setRawHtml(event.target.value)}
        rows={20}
        style={{ width: "100%" }}
      />
      <p>
        <button type="submit" disabled={disableInputs || !title || !rawHTML}>
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
