import { css, html, LitElement } from "lit";
import { createComponent } from "@lit/react";
import React from "react";

/** @import { VConsole } from "./types.d.ts" */

export class PlayController extends LitElement {
  static properties = {
    runOnStart: { type: Boolean, attribute: "run-on-start" },
    runOnChange: { type: Boolean, attribute: "run-on-change" },
    srcPrefix: { attribute: false },
  };

  static styles = css`
    :host {
      display: contents;
    }
  `;

  constructor() {
    super();
    this.runOnStart = false;
    this.runOnChange = false;
    this.srcPrefix = "";
  }

  /** @param {Record<string, string>} code */
  set code(code) {
    if (!this.initialCode) {
      this.initialCode = code;
    }
    const editors = this.querySelectorAll("play-editor");
    editors.forEach((editor) => {
      const language = this._langAlias(editor.language);
      if (language) {
        const value = code[language];
        if (value !== undefined) {
          editor.value = value;
        }
      }
    });
    if (this.runOnStart) {
      this.run();
    }
  }

  get code() {
    /** @type {Record<string, string>} */
    const code = { ...this.initialCode };
    const editors = this.querySelectorAll("play-editor");
    editors.forEach((editor) => {
      const language = this._langAlias(editor.language);
      if (language) {
        code[language] = editor.value;
      }
    });
    return code;
  }

  async format() {
    try {
      await Promise.all(
        Array.from(this.querySelectorAll("play-editor")).map((e) => e.format())
      );
    } catch (e) {
      console.error(e);
    }
  }

  run() {
    this.querySelector("play-console")?.vconsole.clear();
    const runner = this.querySelector("play-runner");
    if (runner) {
      runner.srcPrefix = this.srcPrefix;
      runner.code = this.code;
    }
  }

  reset() {
    if (this.initialCode) {
      this.code = this.initialCode;
    }
    if (this.runOnStart) {
      this.run();
    } else {
      this.querySelector("play-console")?.vconsole.clear();
      const runner = this.querySelector("play-runner");
      if (runner) {
        runner.code = undefined;
      }
    }
  }

  /**
   * @param {string} lang
   */
  _langAlias(lang) {
    switch (lang) {
      case "javascript":
        return "js";
      default:
        return lang;
    }
  }

  _onEditorUpdate() {
    if (this.runOnChange) {
      this.run();
    }
  }

  /** @param {CustomEvent<VConsole>} ev */
  _onConsole(ev) {
    this.querySelector("play-console")?.onConsole(ev);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <slot @update=${this._onEditorUpdate} @console=${this._onConsole}></slot>
    `;
  }
}

customElements.define("play-controller", PlayController);

export const ReactPlayController = createComponent({
  tagName: "play-controller",
  elementClass: PlayController,
  react: React,
});
