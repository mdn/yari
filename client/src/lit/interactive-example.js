import { html, LitElement } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import "./play/editor.js";
import "./play/controller.js";
import "./play/console.js";
import "./play/runner.js";
import { GleanMixin } from "./glean-mixin.js";

import styles from "./interactive-example.scss?css" with { type: "css" };

/**
 * @import { Ref } from 'lit/directives/ref.js';
 * @import { PlayController } from "./play/controller.js";
 */

export class InteractiveExample extends GleanMixin(LitElement) {
  static styles = styles;

  /** @type {Ref<PlayController>} */
  _controller = createRef();

  _run() {
    this._controller.value?.run();
  }

  _reset() {
    this._controller.value?.reset();
  }

  _initialCode() {
    const examples =
      this.closest("section")?.querySelectorAll(".code-example pre");
    return Array.from(examples || []).reduce((acc, pre) => {
      const language = pre.classList[1];
      return language && pre.textContent
        ? {
            ...acc,
            [language]: acc[language]
              ? `${acc[language]}\n${pre.textContent}`
              : pre.textContent,
          }
        : acc;
    }, /** @type {Object<string, string>} */ ({}));
  }

  /** @param {Event} ev  */
  _telemetryHandler(ev) {
    let action = ev.type;
    if (
      ev.type === "click" &&
      ev.target instanceof HTMLElement &&
      ev.target.id
    ) {
      action = `click@${ev.target.id}`;
    }
    this._gleanClick(`interactive-examples-lit: ${action}`);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("focus", this._telemetryHandler);
    this.addEventListener("copy", this._telemetryHandler);
    this.addEventListener("cut", this._telemetryHandler);
    this.addEventListener("paste", this._telemetryHandler);
    this.addEventListener("click", this._telemetryHandler);
  }

  render() {
    return html`
      <play-controller ${ref(this._controller)}>
        <div class="template-javascript">
          <h4>JavaScript Demo:</h4>
          <play-editor language="javascript"></play-editor>
          <div class="buttons">
            <button @click=${this._run}>Run</button>
            <button @click=${this._reset}>Reset</button>
          </div>
          <play-console></play-console>
          <play-runner></play-runner>
        </div>
      </play-controller>
    `;
  }

  firstUpdated() {
    const code = this._initialCode();
    if (this._controller.value) {
      this._controller.value.code = code;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("focus", this._telemetryHandler);
    this.removeEventListener("copy", this._telemetryHandler);
    this.removeEventListener("cut", this._telemetryHandler);
    this.removeEventListener("paste", this._telemetryHandler);
    this.removeEventListener("click", this._telemetryHandler);
  }
}

customElements.define("interactive-example", InteractiveExample);
