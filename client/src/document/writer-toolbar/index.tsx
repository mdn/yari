import React from "react";
import { Doc } from "../types";
import { EditButtons } from "./edit-buttons";
import { ToggleDocumentFlaws } from "./flaws";
import DocumentSpy from "./spy";

export default function WriterToolbar({
  doc,
  onMessage,
}: {
  doc: Doc;
  onMessage: Function;
}) {
  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <EditButtons source={doc.source} />
        <DocumentSpy onMessage={onMessage} />
      </div>
      <ToggleDocumentFlaws flaws={doc.flaws} />
    </div>
  );
}
