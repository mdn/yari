import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDebouncedCallback } from "use-debounce";

import "./form.scss";
import useSWR from "swr";

type DocumentFormData = {
  rawHTML: string;
  metadata: { slug: string; title: string; tags: Array<string> };
};

// Same as DocumentFormData but metadata also includes the locale
export type DocumentOutData = DocumentFormData & {
  metadata: DocumentFormData["metadata"] & { locale: string };
};

export function DocumentForm({
  onSave,
  initialSlug,
  doc,
  isSaving,
  savingError,
}: {
  onSave: (doc: DocumentOutData, didSlugChange: boolean) => unknown;
  initialSlug?: string | null;
  doc?: DocumentFormData;
  isSaving?: boolean;
  savingError?: null | Error;
}) {
  const { locale } = useParams();

  const [slug, setSlug] = useState(
    initialSlug ? initialSlug + "/" : doc ? doc.metadata.slug : ""
  );
  const [title, setTitle] = useState(doc ? doc.metadata.title : "");
  const [rawHTML, setRawHtml] = useState(doc ? doc.rawHTML : "");
  const [tags, setTags] = useState(doc ? doc.metadata.tags : []);

  const [autosaveEnabled, setAutoSaveEnabled] = useLocalStorage(
    "autosaveEdit",
    false
  );

  const { data: slugExists } = useSWR(
    `exists:${slug}`,
    async () =>
      (
        await fetch(
          `/_document?${new URLSearchParams({
            url: `/${locale}/docs/${slug}`,
          }).toString()}`
        )
      ).ok
  );

  const isNew = !doc;

  // New documents should not autosave
  const canAutosave = !isNew && autosaveEnabled;

  const didSlugChange = Boolean(doc && doc.metadata.slug !== slug);

  const willAutosave = canAutosave && !didSlugChange;

  // In auto-save mode inputs should still be changeable during saving
  const disableInputs = !willAutosave && isSaving;

  const invalidSlug = slug.endsWith("/");

  function toggleAutoSave() {
    setAutoSaveEnabled(!autosaveEnabled);
  }

  function removeTag(tag: string) {
    setTags(tags.filter((elem) => elem !== tag));
  }

  function addTag() {
    const input: any = document.getElementById("newTag");
    const newTag: string = input.value;
    if (tags.includes(newTag)) {
      console.log("This tag is already there:", newTag);
    } else {
      setTags([...tags, newTag]);
    }
    input.value = "";
  }

  const { callback: debounceCallback } = useDebouncedCallback(onSave, 1000);

  useEffect(() => {
    if (willAutosave) {
      debounceCallback(
        {
          rawHTML,
          metadata: { slug, title, locale, tags },
        },
        didSlugChange
      );
    }
  }, [
    willAutosave,
    debounceCallback,
    slug,
    tags,
    title,
    rawHTML,
    didSlugChange,
    locale,
  ]);

  return (
    <form
      className="document-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(
          {
            rawHTML,
            metadata: { slug, title, locale, tags },
          },
          didSlugChange
        );
      }}
    >
      <div>
        <label>
          Slug
          <input
            disabled={!isNew}
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        {slugExists && !(doc && doc.metadata.slug === slug) && (
          <div className="form-warning">
            Warning! This slug already exists, creating this document will
            override the other document using that slug.
          </div>
        )}
        {invalidSlug && (
          <div className="form-warning">
            Slugs are not allowed to end in a slash
          </div>
        )}
      </div>

      {didSlugChange && canAutosave && (
        <div>
          Autosave has been temporarily disabled until the new slug is saved!
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

      <div>
        <label>Tags</label>
        <ul>
          {tags.map((tag) => (
            <li key={tag}>
              {tag}
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => removeTag(tag)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginBottom: "5px" }}>
          <input
            id="newTag"
            disabled={disableInputs}
            type="text"
            placeholder="New tag"
            defaultValue=""
          />
          <button
            type="submit"
            disabled={disableInputs}
            style={{ marginLeft: "10px" }}
            onClick={(event) => {
              event.preventDefault();
              addTag();
            }}
          >
            Add tag
          </button>
        </div>
      </div>

      <textarea
        disabled={disableInputs}
        value={rawHTML}
        onChange={(event) => setRawHtml(event.target.value)}
        rows={20}
        style={{ width: "100%" }}
      />
      <p>
        <button
          type="submit"
          disabled={disableInputs || !title || !slug || invalidSlug || !rawHTML}
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
