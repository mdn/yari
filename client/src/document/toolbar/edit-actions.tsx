import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useDocumentURL } from "../hooks";

import "./edit-actions.scss";

export function EditActions({ folder }: { folder: string }) {
  const location = useLocation();
  const documentURL = useDocumentURL();
  const navigate = useNavigate();

  const [opening, setOpening] = useState(false);
  const [editorOpeningError, setEditorOpeningError] = useState<Error | null>(
    null
  );

  useEffect(() => {
    let unsetOpeningTimer: ReturnType<typeof setTimeout>;
    if (opening) {
      unsetOpeningTimer = setTimeout(() => {
        setOpening(false);
      }, 3000);
    }
    return () => {
      if (unsetOpeningTimer) {
        clearTimeout(unsetOpeningTimer);
      }
    };
  }, [opening]);

  async function openInEditorHandler(event: React.MouseEvent) {
    event.preventDefault();

    const filepath = folder + "/index.html";
    console.log(`Going to try to open ${filepath} in your editor`);
    setOpening(true);
    try {
      const response = await fetch(`/_open?filepath=${filepath}`);
      if (!response.ok) {
        if (response.status >= 500) {
          setEditorOpeningError(
            new Error(`${response.status}: ${response.statusText}`)
          );
        } else {
          const body = await response.text();
          setEditorOpeningError(new Error(`${response.status}: ${body}`));
        }
      }
    } catch (err) {
      setEditorOpeningError(err);
    }
  }

  async function deleteDocument() {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }
    const response = await fetch(
      `/_document?url=${encodeURIComponent(documentURL)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (response.ok) {
      window.alert("Document successfully deleted");
      navigate("/");
    } else {
      window.alert(`Error while deleting document: ${response.statusText}`);
    }
  }

  const { locale, "*": slug } = useParams();

  if (!folder) {
    return null;
  }

  return (
    <div className="edit-actions">
      <a href={`https://developer.mozilla.org/${locale}/docs/${slug}`}>
        View on MDN
      </a>{" "}
      Edit{" "}
      <Link to={location.pathname.replace("/docs/", "/_edit/")}>
        in your <b>browser</b>
      </Link>
      {" or "}
      <button title={`Folder: ${folder}`} onClick={openInEditorHandler}>
        in your <b>editor</b>
      </button>
      <button className="delete" onClick={deleteDocument}>
        Delete document
      </button>
      <Link to={`/en-US/_create?initial_slug=${encodeURIComponent(slug)}`}>
        Create new document
      </Link>
      <br />
      {editorOpeningError ? (
        <p className="error-message editor-opening-error">
          <b>Error opening page in your editor!</b>
          <br />
          <code>{editorOpeningError.toString()}</code>
        </p>
      ) : (
        opening && <small>Trying to your editor now...</small>
      )}
    </div>
  );
}
