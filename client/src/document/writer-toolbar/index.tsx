import React from "react";
import { Link, useParams } from "react-router-dom";
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
  const params = useParams();
  return (
    <div className="writer-toolbar">
      <div className="writer-toolbar-first-row">
        <Link to={`/en-US/_create/${params["*"]}`}>Create new document</Link>
        <EditButtons source={doc.source} />
        <Spy onDocumentUpdate={onDocumentUpdate} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
