import { html, LitElement } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { createComponent } from "@lit/react";
import { Task } from "@lit/task";
import React from "react";

import { compressAndBase64Encode } from "../../playground/utils.ts";
import { PLAYGROUND_BASE_HOST } from "../../env.ts";
import { ThemeController } from "../theme-controller.js";

import styles from "./runner.scss?css" with { type: "css" };

/**
 * @import { RunnerDefaults, VConsole } from "./types"
 * @import { EventName } from "@lit/react"
 * @import { Ref } from "lit/directives/ref.js"; */

export class PlayRunner extends LitElement {
  static properties = {
    code: { type: Object },
    defaults: { type: String },
    srcPrefix: { type: String, attribute: "src-prefix" },
    sandbox: { type: String },
  };

  static styles = styles;

  constructor() {
    super();
    /** @type {ThemeController} */
    this.theme = new ThemeController(this);
    /** @type {Record<string, string> | undefined} */
    this.code = undefined;
    /** @type {RunnerDefaults | undefined} */
    this.defaults = undefined;
    /** @type {string | undefined} */
    this.srcPrefix = undefined;
    this.sandbox = "";
    this._subdomain = crypto.randomUUID();
    /** @type {Promise<true>} */
    this.ready = new Promise((resolve) => {
      this._resolveReady = () => resolve(true);
    });
  }

  /** @type {Ref<HTMLIFrameElement>} */
  _iframe = createRef();

  /** @param {MessageEvent} e  */
  _onMessage({ data: { typ, prop, args }, origin, source }) {
    /** @type {string | undefined} */
    let uuid = new URL(origin, "https://example.com").hostname.split(".")[0];
    if (uuid !== this._subdomain && source && "location" in source) {
      // `origin` doesn't contain the uuid on localhost
      // so check `source` for the uuid param we set
      // this only works on localhost (it errors cross-origin)
      try {
        uuid =
          new URLSearchParams(source.location.search).get("uuid") || undefined;
      } catch {
        uuid = undefined;
      }
    }
    if (uuid !== this._subdomain) {
      return;
    }
    if (typ === "console") {
      /** @type {VConsole} */
      const detail = { prop, args };
      this.dispatchEvent(
        new CustomEvent("console", { bubbles: true, composed: true, detail })
      );
    } else if (typ === "ready") {
      this._resolveReady();
    }
  }

  _constructUrl() {
    const url = new URL(
      window.location.hostname.endsWith("localhost")
        ? window.location.origin
        : `${window.location.protocol}//${
            PLAYGROUND_BASE_HOST.startsWith("localhost")
              ? ""
              : `${this._subdomain}.`
          }${PLAYGROUND_BASE_HOST}`
    );
    url.pathname = "runner.html";
    return url;
  }

  _updateSrc = new Task(this, {
    args: () =>
      /** @type {const} */ ([
        this.code,
        this.defaults,
        this.theme.value,
        this.srcPrefix,
      ]),
    task: async ([code, defaults, theme, srcPrefix], { signal }) => {
      if (code && code.js && code.wat) {
        const watUrl = await compileAndEncodeWatToDataUrl(code.wat);
        code.js = code.js.replace("{%wasm-url%}", watUrl);
      }
      const { state } = await compressAndBase64Encode(
        JSON.stringify({
          html: code?.html || "",
          css: code?.css || "",
          js: code?.js || "",
          defaults: defaults,
          theme: theme,
        })
      );
      const prefix = (srcPrefix || "").replace(/\/$/, "");
      signal.throwIfAborted();
      // We're using a random subdomain for origin isolation.
      const url = this._constructUrl();
      if (!url.host.startsWith(this._subdomain)) {
        // pass the uuid for postMessage isolation on localhost
        url.searchParams.set("uuid", this._subdomain);
      }
      url.searchParams.set("state", state);
      url.pathname = `${prefix}/runner.html`;
      const src = url.href;
      // update iframe src without adding to browser history
      this._iframe.value?.contentWindow?.location.replace(src);
    },
  });

  connectedCallback() {
    super.connectedCallback();
    this._onMessage = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessage);
  }

  /** @param {any} message */
  async postMessage(message) {
    await this.ready;
    this._iframe.value?.contentWindow?.postMessage(message, "*");
  }

  render() {
    const url = this._constructUrl();
    url.searchParams.set("blank", "");
    url.searchParams.set("theme", this.theme.initialValue);
    return html`
      <iframe
        ${ref(this._iframe)}
        src=${url.href}
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

/**
 * Converts a Uint8Array to a base64 encoded string
 * @param {Uint8Array} bytes - The array of bytes to convert
 * @returns {string} The base64 encoded string representation of the input bytes
 */
function uInt8ArrayToBase64(bytes) {
  const binString = Array.from(bytes, (byte) =>
    String.fromCodePoint(byte)
  ).join("");
  return btoa(binString);
}

/**
 * compiles the wat code to wasm
 * @param {string} wat
 * @returns {Promise<string>} a data-url with the compiled wasm, base64 encoded
 */
async function compileAndEncodeWatToDataUrl(wat) {
  const { default: init, watify } = await import("@mdn/watify");
  await init();
  const binary = watify(wat);
  const b64 = `data:application/wasm;base64,${uInt8ArrayToBase64(binary)}`;
  return b64;
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
