import { html, LitElement, nothing } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { decode } from "he";

import "../play/editor.js";
import "../play/controller.js";
import "../play/console.js";
import "../play/runner.js";
import { GleanMixin } from "../glean-mixin.js";
import "./tabs.js";

import styles from "./index.scss?css" with { type: "css" };

import exampleJs from "./example.js?raw";
import exampleStyle from "./example.css?raw";
import choiceJs from "./choice.js?raw";
import choiceStyle from "./choice.css?raw";
import { PlayEditor } from "../play/editor.js";
import { isCSSSupported } from "./utils.js";

/**
 * @import { Ref } from 'lit/directives/ref.js';
 * @import { PlayController } from "../play/controller.js";
 * @import { PlayRunner } from "../play/runner.js";
 */

const LANGUAGE_CLASSES = ["html", "js", "css"];
const GLEAN_EVENT_TYPES = ["focus", "copy", "cut", "paste", "click"];

export class InteractiveExample extends GleanMixin(LitElement) {
  static properties = {
    name: { type: String },
    choiceSelected: { type: Number, state: true },
    choiceUnsupportedMask: { type: Number, state: true },
  };

  static styles = styles;

  constructor() {
    super();
    this.name = "";
    /** @type {string[]} */
    this._languages = [];
    /** @type {Record<string, string>} */
    this._code = {};
    /** @type {number} */
    this.choiceSelected = -1;
    /** @type {number} */
    this.choiceUnsupportedMask = 0;
  }

  /** @type {Ref<PlayController>} */
  _controller = createRef();
  /** @type {Ref<PlayRunner>} */
  _runner = createRef();

  _run() {
    this._controller.value?.run();
  }

  _reset() {
    this._controller.value?.reset();
    if (this._template === "choices") {
      this._resetChoices();
    }
  }

  _initialCode() {
    const exampleNodes = this.closest("section")?.querySelectorAll(
      ".code-example pre.interactive-example"
    );
    const code = Array.from(exampleNodes || []).reduce((acc, pre) => {
      const language = Array.from(pre.classList).find((c) =>
        LANGUAGE_CLASSES.includes(c)
      );
      return language && pre.textContent
        ? {
            ...acc,
            [language]: acc[language]
              ? `${acc[language]}\n${pre.textContent}`
              : pre.textContent,
          }
        : acc;
    }, /** @type {Object<string, string>} */ ({}));
    const choiceNodes = this.closest("section")?.querySelectorAll(
      ".code-example pre.interactive-example-choice"
    );
    this._choices = Array.from(choiceNodes || []).map((pre) =>
      pre.textContent?.trim()
    );
    this._languages = Object.keys(code);
    this._template = this._choices.length
      ? "choices"
      : this._languages.length === 1 && this._languages[0] === "js"
        ? "javascript"
        : "tabbed";
    if (this._template === "tabbed") {
      code["js-hidden"] = exampleJs;
      code["css-hidden"] = exampleStyle;
    }
    if (this._template === "choices") {
      code["js-hidden"] = choiceJs;
      code["css-hidden"] = choiceStyle;
    }
    return code;
  }

  /** @param {string} lang */
  _langName(lang) {
    switch (lang) {
      case "html":
        return "HTML";
      case "css":
        return "CSS";
      case "js":
        return "JavaScript";
      default:
        return lang;
    }
  }

  /** @param {MouseEvent} event  */
  _choiceClick({ target }) {
    // TODO: use a different event handler for editor update event
    // TODO: deal with update race conditions (editor updates after user clicks on different editor)
    if (target instanceof PlayEditor) {
      const choice = target.closest(".choice");
      const choiceIndex = Array.prototype.indexOf.call(
        choice?.parentNode?.children,
        choice
      );
      this._selectChoice(choiceIndex, target.value);
    }
  }

  _resetChoices() {
    this.choiceSelected = -1;
    this.choiceUnsupportedMask = 0;
    const editorNodes = Array.from(
      this.shadowRoot?.querySelectorAll("play-editor") || []
    );
    Array.from(editorNodes).forEach((editorNode, index) => {
      editorNode.value = this._choices?.at(index) ?? "";
    });
    this._selectChoice(0);
  }

  /**
   * @param {Number} index
   * @param {string|undefined} code
   */
  async _selectChoice(index, code = undefined) {
    code = typeof code === "string" ? code : this._choices?.at(index) || "";

    if (!code) {
      console.debug("No code selected");
      return;
    }

    // TODO: nicer interface for posting messages than this:
    const runner = this._runner.value;

    if (!runner) {
      console.error("No runner");
      return;
    }

    // Ensures it has an iframe.
    await runner.updateComplete;

    const shadowRoot = runner.shadowRoot;

    if (!shadowRoot) {
      console.error("No shadowRoot");
      return;
    }

    const iframe = shadowRoot.querySelector("iframe");

    if (!iframe) {
      console.error("No iframe");
      return;
    }

    const contentWindow = iframe.contentWindow;

    if (!contentWindow) {
      console.error("No contentWindow");
      return;
    }

    const applyCode = () => {
      this.choiceSelected = index;

      const unsupported = !isCSSSupported(code);
      this.choiceUnsupportedMask &= ~(1 << index);
      this.choiceUnsupportedMask |= Number(unsupported) << index;
      contentWindow.postMessage({ typ: "choice", code }, "*");
    };

    if (contentWindow.document.readyState === "complete") {
      applyCode();
    } else {
      iframe.addEventListener("load", applyCode);
    }
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
    this._telemetryHandler = this._telemetryHandler.bind(this);
    GLEAN_EVENT_TYPES.forEach((type) => {
      this.renderRoot.addEventListener(type, this._telemetryHandler);
    });
    this._code = this._initialCode();
  }

  _renderJavascript() {
    return html`
      <play-controller ${ref(this._controller)}>
        <div class="template-javascript">
          <header>
            <h4>${decode(this.name)}</h4>
          </header>
          <play-editor id="editor" language="js"></play-editor>
          <div class="buttons">
            <button id="execute" @click=${this._run}>Run</button>
            <button id="reset" @click=${this._reset}>Reset</button>
          </div>
          <play-console id="console"></play-console>
          <play-runner></play-runner>
        </div>
      </play-controller>
    `;
  }

  _renderTabbed() {
    return html`
      <play-controller ${ref(this._controller)} run-on-start run-on-change>
        <div class="template-tabbed">
          <header>
            <h4>${decode(this.name)}</h4>
            <button id="reset" @click=${this._reset}>Reset</button>
          </header>
          <ix-tab-wrapper>
            ${this._languages.map(
              (lang) => html`
                <ix-tab id=${lang}>${this._langName(lang)}</ix-tab>
                <ix-tab-panel id=${`${lang}-panel`}>
                  <play-editor language=${lang}></play-editor>
                </ix-tab-panel>
              `
            )}
          </ix-tab-wrapper>
          <div class="output-wrapper">
            <h4>Output</h4>
            <play-runner
              ${ref(this._runner)}
              sandbox="allow-top-navigation-by-user-activation"
            ></play-runner>
          </div>
        </div>
      </play-controller>
    `;
  }

  _renderChoices() {
    return html`
      <div class="template-choices">
        <header>
          <h4>${decode(this.name)}</h4>
          <button id="reset" @click=${this._reset}>Reset</button>
        </header>
        <div
          class="choice-wrapper"
          @click=${this._choiceClick}
          @update=${this._choiceClick}
        >
          ${this._choices?.map(
            (code, index) => html`
              <div
                class=${[
                  "choice",
                  ...(index === this.choiceSelected ? ["selected"] : []),
                  ...((1 << index) & this.choiceUnsupportedMask
                    ? ["unsupported"]
                    : []),
                ].join(" ")}
              >
                <play-editor
                  language="css"
                  minimal="true"
                  .delay=${100}
                  .value=${code?.trim()}
                ></play-editor>
              </div>
            `
          )}
        </div>
        <div class="output-wrapper">
          <play-controller ${ref(this._controller)} run-on-start>
            <play-runner ${ref(this._runner)}></play-runner>
          </play-controller>
        </div>
      </div>
    `;
  }

  render() {
    switch (this._template) {
      case "javascript":
        return this._renderJavascript();
      case "tabbed":
        return this._renderTabbed();
      case "choices":
        return this._renderChoices();
      default:
        return nothing;
    }
  }

  firstUpdated() {
    if (this._controller.value) {
      this._controller.value.code = this._code;
    }
    if (this._template === "choices") {
      this._selectChoice(0);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    GLEAN_EVENT_TYPES.forEach((type) => {
      this.renderRoot.removeEventListener(type, this._telemetryHandler);
    });
  }
}

customElements.define("interactive-example", InteractiveExample);
