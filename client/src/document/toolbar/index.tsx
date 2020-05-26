import React from "react";
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
  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <EditActions folder={doc.source.folder} />
        <Watcher onDocumentUpdate={onDocumentUpdate} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
