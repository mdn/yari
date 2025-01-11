import { createComponent } from "@lit/react";
import { html, LitElement } from "lit";
import React from "react";
import { formatOutput } from "./console-utils.js";

import styles from "./console.scss?css" with { type: "css" };

/** @import { VConsole } from "./types.d.ts" */

/** @implements {Partial<Console>} */
class VirtualConsole {
  #host;

  /** @param {PlayConsole} host  */
  constructor(host) {
    this.#host = host;
  }

  clear() {
    this.#host._messages = [];
  }

  /** @param {...any} args */
  debug(...args) {
    return this.log(...args);
  }

  /** @param {...any} args */
  error(...args) {
    return this.log(...args);
  }

  /** @param {...any} args */
  info(...args) {
    return this.log(...args);
  }

  /** @param {...any} args */
  log(...args) {
    // TODO: support string substitutions:
    // https://developer.mozilla.org/en-US/docs/Web/API/console#using_string_substitutions
    const formatted = args.map((x) => formatOutput(x));
    this.#host._messages = [...this.#host._messages, formatted.join(" ")];
  }

  /** @param {...any} args */
  warn(...args) {
    return this.log(...args);
  }
}

export class PlayConsole extends LitElement {
  static properties = {
    _messages: { state: true },
  };

  static styles = styles;

  constructor() {
    super();
    this.vconsole = new VirtualConsole(this);
    /** @type {string[]} */
    this._messages = [];
  }

  /** @param {CustomEvent<VConsole>} e */
  onConsole({ detail }) {
    if (detail.prop in this.vconsole) {
      const prop = /** @type keyof typeof this.vconsole */ (detail.prop);
      detail.args ? this.vconsole[prop](...detail.args) : this.vconsole[prop]();
    } else {
      this.vconsole.warn(
        "[Playground] Unsupported console message (see browser console)"
      );
    }
  }

  render() {
    return html`
      <ul>
        ${this._messages.map((message) => {
          return html`
            <li>
              <code>${message}</code>
            </li>
          `;
        })}
      </ul>
    `;
  }

  updated() {
    const output = this.renderRoot.querySelector("ul");
    output?.scrollTo({ top: output.scrollHeight });
  }
}

customElements.define("play-console", PlayConsole);

export const ReactPlayConsole = createComponent({
  tagName: "play-console",
  elementClass: PlayConsole,
  react: React,
});
