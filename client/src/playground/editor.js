import { keymap, highlightActiveLine, lineNumbers } from "@codemirror/view";
import { EditorState, StateEffect } from "@codemirror/state";
import { indentOnInput, bracketMatching } from "@codemirror/language";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from "@codemirror/autocomplete";
import { lintKeymap } from "@codemirror/lint";
import { EditorView, minimalSetup } from "codemirror";
import { javascript as langJS } from "@codemirror/lang-javascript";
import { css as langCSS } from "@codemirror/lang-css";
import { html as langHTML } from "@codemirror/lang-html";
import { oneDark } from "@codemirror/theme-one-dark";

import { createComponent } from "@lit/react";
import { html, LitElement } from "lit";
import React from "react";

import styles from "./editor.scss?css" with { type: "css" };

/** @import { PropertyValues } from "lit" */

export class PlayEditor extends LitElement {
  static properties = {
    language: { type: String },
    colorScheme: { attribute: false },
    value: { attribute: false },
  };

  static styles = styles;

  /** @type {EditorView | undefined} */
  _editor;

  /** @type {number} */
  _updateTimer = -1;

  constructor() {
    super();
    this.language = "";
    this.colorScheme = "os-default";
    this._value = "";
  }

  /** @param {string} value */
  set value(value) {
    this._value = value;
    if (this._editor) {
      let state = EditorState.create({
        doc: value,
        extensions: this._extensions(),
      });
      this._editor.setState(state);
    }
  }

  get value() {
    return this._editor ? this._editor.state.doc.toString() : this._value;
  }

  _extensions() {
    const language = (() => {
      switch (this.language) {
        case "javascript":
          return [langJS()];
        case "html":
          return [langHTML()];
        case "css":
          return [langCSS()];
        default:
          return [];
      }
    })();
    return [
      minimalSetup,
      lineNumbers(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightActiveLine(),
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...completionKeymap,
        ...lintKeymap,
        indentWithTab,
      ]),
      EditorView.lineWrapping,
      ...(this.colorScheme === "dark" ? [oneDark] : []),
      ...language,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          if (this._updateTimer !== -1) {
            clearTimeout(this._updateTimer);
          }
          this._updateTimer = window?.setTimeout(() => {
            this._updateTimer = -1;
            this.dispatchEvent(
              new Event("update", { bubbles: false, composed: true })
            );
          }, 1000);
        }
      }),
    ];
  }

  /** @param {PropertyValues} changedProperties */
  willUpdate(changedProperties) {
    if (
      changedProperties.has("colorScheme") ||
      changedProperties.has("language")
    ) {
      this._editor?.dispatch({
        effects: StateEffect.reconfigure.of(this._extensions()),
      });
    }
  }

  render() {
    return html`<details class="container" open>
      <summary>${this.language.toUpperCase()}</summary>
      <div class="editor"></div>
    </details>`;
  }

  firstUpdated() {
    let startState = EditorState.create({
      doc: this._value,
      extensions: this._extensions(),
    });
    this._editor = new EditorView({
      state: startState,
      parent: this.renderRoot.querySelector("div") || undefined,
    });
  }
}

customElements.define("play-editor", PlayEditor);

export const ReactPlayEditor = createComponent({
  tagName: "play-editor",
  elementClass: PlayEditor,
  react: React,
  events: {
    onUpdate: "update",
  },
});
