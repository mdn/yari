import { EditorState } from "@codemirror/state";
import { bracketMatching } from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";
import { minimalSetup } from "codemirror";

import { createComponent } from "@lit/react";
import React from "react";
import { PlayEditor } from "./editor.js";

const preventNewLines = () =>
  EditorState.transactionFilter.of((transaction) =>
    transaction.newDoc.lines > 1 ? [] : transaction
  );

export class PlayEditorLine extends PlayEditor {
  _defaultExtensions() {
    return [
      minimalSetup,
      bracketMatching(),
      closeBrackets(),
      preventNewLines(),
    ];
  }
}

customElements.define("play-editor-line", PlayEditorLine);

export const ReactPlayEditor = createComponent({
  tagName: "play-editor-line",
  elementClass: PlayEditorLine,
  react: React,
  events: {
    onUpdate: "update",
  },
});
