import { useEffect } from "react";
import { WRITER_MODE_HOSTNAMES } from "../../env";
import { Doc } from "../../../../libs/types/document";
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
    try {
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
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(visits.slice(0, 20))
      );
    } catch (err) {
      console.warn("Unable to write viewed documents to localStorage", err);
    }
  }, [doc]);

  const isReadOnly = !WRITER_MODE_HOSTNAMES.includes(window.location.hostname);

  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <EditActions source={doc.source} />
      </div>
      {isReadOnly && (
        <div>
          <i>
            You're in <b>read-only</b> mode.
          </i>
        </div>
      )}
      <ToggleDocumentFlaws doc={doc} reloadPage={reloadPage} />
    </div>
  );
}
