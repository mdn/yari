import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useDocumentURL } from "../hooks";
import { Source } from "../types";

import "./edit-buttons.scss";

export function EditButtons({ source }: { source: Source }) {
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

  const { github_url, folder } = source;

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
    await fetch(`/_document?url=${encodeURIComponent(documentURL)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    navigate("/");
  }

  if (!source) {
    return null;
  }

  return (
    <div className="edit-buttons">
      Edit
      <a
        href={github_url}
        title={`Folder: ${folder}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {" "}
        on <b>GitHub</b>
      </a>
      {" or "}
      <Link to={location.pathname.replace("/docs/", "/_edit/")}>
        in your <b>browser</b>
      </Link>
      {" or "}
      <button title={`Folder: ${folder}`} onClick={openInEditorHandler}>
        in your <b>editor.</b>
      </button>
      <button className="delete" onClick={deleteDocument}>
        Delete document
      </button>
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
