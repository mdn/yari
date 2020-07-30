import React from "react";
import { Doc } from "../types";
import { EditActions } from "./edit-actions";
import { ToggleDocumentFlaws } from "./flaws";
import WatchInfo from "./watch-info";

import "./index.scss";

export default function Toolbar({ doc }: { doc: Doc }) {
  return (
    <div className="toolbar">
      <div className="toolbar-first-row">
        <EditActions folder={doc.source.folder} />
        <WatchInfo />
      </div>
      <ToggleDocumentFlaws doc={doc} />
    </div>
  );
}
