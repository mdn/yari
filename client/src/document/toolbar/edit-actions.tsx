import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { WRITER_MODE_HOSTNAMES } from "../../env";
import { Source } from "../../../../libs/types/document";

import "./edit-actions.scss";
import { useLocale } from "../../hooks";

export function EditActions({ source }: { source: Source }) {
  const { folder, filename, github_url } = source;

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

    const filepath = `${folder}/${filename}`;
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
    } catch (err: any) {
      setEditorOpeningError(err);
    }
  }

  const locale = useLocale();
  const { "*": slug } = useParams();

  if (!folder) {
    return null;
  }

  // If window.location.host is 'localhost:3000` then
  // window.location.hostname is 'localhost'
  const isReadOnly = !WRITER_MODE_HOSTNAMES.includes(window.location.hostname);

  return (
    <ul className="edit-actions">
      {!isReadOnly && (
        <li>
          <button
            type="button"
            className="button"
            title={`Folder: ${folder}`}
            onClick={openInEditorHandler}
          >
            Open in your <b>editor</b>
          </button>
        </li>
      )}

      <li>
        <a
          href={`https://developer.mozilla.org/${locale}/docs/${slug}`}
          className="button"
        >
          View on MDN
        </a>
      </li>

      {!isReadOnly && (
        <li>
          <a
            href={github_url.replace("/blob/", "/edit/")}
            className="button"
            rel="noopener noreferrer"
          >
            Edit on <b>GitHub</b>
          </a>
        </li>
      )}

      {editorOpeningError ? (
        <p className="error-message editor-opening-error">
          <b>Error opening page in your editor!</b>
          <br />
          <code>{editorOpeningError.toString()}</code>
        </p>
      ) : (
        opening && <small>Trying to your editor now...</small>
      )}
    </ul>
  );
}
