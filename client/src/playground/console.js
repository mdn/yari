import { createComponent } from "@lit/react";
import { html, LitElement } from "lit";
import React from "react";

import styles from "./console.scss?css" with { type: "css" };

/** @import { VConsole } from "./types" */

export class PlayConsole extends LitElement {
  static properties = {
    vConsole: { attribute: false },
  };

  static styles = styles;

  constructor() {
    super();
    /** @type {VConsole[]} */
    this.vConsole = [];
  }

  render() {
    return html`
      <span class="header">Console</span>
      <ul>
        ${this.vConsole.map(({ message }) => {
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
