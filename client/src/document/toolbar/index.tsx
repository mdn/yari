import React from "react";
import { Doc } from "../types";
import { EditActions } from "./edit-actions";
import { ToggleDocumentFlaws } from "./flaws";
import Watcher from "./watcher";

import "./index.scss";

export default function Toolbar({ doc }: { doc: Doc }) {
  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <EditActions folder={doc.source.folder} />
        <Watcher />
      </div>
      <ToggleDocumentFlaws doc={doc} />
    </div>
  );
}
