import React from "react";
import { Doc } from "../types";
import { EditButtons } from "./edit-buttons";
import { ToggleDocumentFlaws } from "./flaws";
import DocumentSpy from "./spy";

import "./index.scss";

export default function WriterToolbar({
  doc,
  onMessage,
}: {
  doc: Doc;
  onMessage: Function;
}) {
  return (
    <div className="writer-toolbar">
      <div className="writer-toolbar-first-row">
        <EditButtons source={doc.source} />
        <DocumentSpy onMessage={onMessage} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
