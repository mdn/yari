import React, { useEffect } from "react";
import { CRUD_MODE_HOSTNAMES } from "../../constants";
import { Doc } from "../types";
import { EditActions } from "./edit-actions";
import { ToggleDocumentFlaws } from "./flaws";

import "./index.scss";

export default function Toolbar({
  doc,
  reloadPage,
}: {
  doc: Doc;
  reloadPage: () => void;
}) {
  // Every time the toolbar is used to view a document, log that in localStorage
  // as a list of recent document views. This can be used on the homepage to
  // help you navigate back to pages you frequently visit.
  useEffect(() => {
    const localStorageKey = "viewed-documents";
    const entry = {
      url: doc.mdn_url,
      title: doc.title,
      timestamp: new Date().getTime(),
    };
    const previousVisits = JSON.parse(
      localStorage.getItem(localStorageKey) || "[]"
    );
    const visits = [
      entry,
      ...previousVisits.filter((v) => v.url !== entry.url),
    ];
    localStorage.setItem(localStorageKey, JSON.stringify(visits.slice(0, 20)));
  }, [doc]);

  const isReadOnly = !CRUD_MODE_HOSTNAMES.includes(window.location.hostname);

  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <EditActions
          folder={doc.source.folder}
          filename={doc.source.filename}
        />
      </div>
      {isReadOnly && (
        <p>
          <i>
            You're in <b>read-only</b> mode.
          </i>
        </p>
      )}
      <ToggleDocumentFlaws doc={doc} reloadPage={reloadPage} />
    </div>
  );
}
