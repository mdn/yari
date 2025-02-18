import { html, LitElement } from "lit";
import { compressAndBase64Encode } from "../../playground/utils.ts";
import { PLAYGROUND_BASE_HOST } from "../../env.ts";
import { createComponent } from "@lit/react";
import { Task } from "@lit/task";
import React from "react";

import styles from "./runner.scss?css" with { type: "css" };

/** @import { VConsole } from "./types" */
/** @import { EventName } from "@lit/react" */

export class PlayRunner extends LitElement {
  static properties = {
    code: { type: Object },
    srcPrefix: { type: String, attribute: "src-prefix" },
    sandbox: { type: String },
  };

  static styles = styles;

  constructor() {
    super();
    /** @type {Record<string, string> | undefined} */
    this.code = undefined;
    /** @type {string | undefined} */
    this.srcPrefix = undefined;
    this.sandbox = "";
    this._subdomain = crypto.randomUUID();
  }

  /** @param {MessageEvent} e  */
  _onMessage({ data: { typ, prop, args } }) {
    if (typ === "console") {
      /** @type {VConsole} */
      const detail = { prop, args };
      this.dispatchEvent(
        new CustomEvent("console", { bubbles: true, composed: true, detail })
      );
    }
  }

  _updateSrc = new Task(this, {
    args: () => /** @type {const} */ ([this.code, this.srcPrefix]),
    task: async ([code, srcPrefix], { signal }) => {
      const { state } = await compressAndBase64Encode(
        JSON.stringify({
          html: code?.html || "",
          css: code?.css || "",
          js: code?.js || "",
        })
      );
      signal.throwIfAborted();
      // We're using a random subdomain for origin isolation.
      const url = new URL(
        window.location.hostname.endsWith("localhost")
          ? window.location.origin
          : `${window.location.protocol}//${
              PLAYGROUND_BASE_HOST.startsWith("localhost")
                ? ""
                : `${this._subdomain}.`
            }${PLAYGROUND_BASE_HOST}`
      );
      url.searchParams.set("state", state);
      url.pathname = `${srcPrefix || ""}/runner.html`;
      const src = url.href;
      // update iframe src without adding to browser history
      this.shadowRoot
        ?.querySelector("iframe")
        ?.contentWindow?.location.replace(src);
    },
  });

  connectedCallback() {
    super.connectedCallback();
    this._onMessage = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessage);
  }

  render() {
    return html`
      <iframe
        src="${window.location
          .protocol}//${PLAYGROUND_BASE_HOST}/runner.html?blank"
        title="runner"
        sandbox="allow-scripts allow-same-origin allow-forms ${this.sandbox}"
      ></iframe>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("message", this._onMessage);
  }
}

customElements.define("play-runner", PlayRunner);

export const ReactPlayRunner = createComponent({
  tagName: "play-runner",
  elementClass: PlayRunner,
  react: React,
  events: {
    onConsole: /** @type {EventName<CustomEvent<VConsole>>} */ ("console"),
  },
});
