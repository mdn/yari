import React from "react";
import { Link, useParams } from "react-router-dom";
import { Doc } from "../types";
import { EditActions } from "./edit-actions";
import { ToggleDocumentFlaws } from "./flaws";
import Watcher from "./watcher";

import "./index.scss";

export default function Toolbar({
  doc,
  onDocumentUpdate,
}: {
  doc: Doc;
  onDocumentUpdate: Function;
}) {
  const params = useParams();
  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <Link to={`/en-US/_create/${params["*"]}`}>Create new document</Link>
        <EditActions folder={doc.source.folder} />
        <Watcher onDocumentUpdate={onDocumentUpdate} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
