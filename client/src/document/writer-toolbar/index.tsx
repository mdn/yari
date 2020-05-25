import React from "react";
import { Link } from "react-router-dom";
import { Doc } from "../types";
import { EditButtons } from "./edit-buttons";
import { ToggleDocumentFlaws } from "./flaws";
import Spy from "./spy";

import "./index.scss";

export default function WriterToolbar({
  doc,
  onDocumentUpdate,
}: {
  doc: Doc;
  onDocumentUpdate: Function;
}) {
  return (
    <div className="writer-toolbar">
      <div className="writer-toolbar-first-row">
        <Link to="/en-US/_create">Create new document</Link>
        <EditButtons source={doc.source} />
        <Spy currentSlug={doc.mdn_url} onDocumentUpdate={onDocumentUpdate} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
