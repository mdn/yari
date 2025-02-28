import { html, LitElement, nothing } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { decode } from "he";

import "../play/editor.js";
import "../play/controller.js";
import "../play/console.js";
import "../play/runner.js";
import { GleanMixin } from "../glean-mixin.js";
import "./tabs.js";

import styles from "./index.scss?css" with { type: "css" };
import choiceJs from "./choice.js?raw";
import choiceStyle from "./choice.css?raw";
import { PlayEditor } from "../play/editor.js";
import { isCSSSupported } from "./utils.js";

/**
 * @import { Ref } from 'lit/directives/ref.js';
 * @import { PlayController } from "../play/controller.js";
 * @import { PlayRunner } from "../play/runner.js";
 */

const LANGUAGE_CLASSES = ["html", "js", "css", "wat"];
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
    if (this._template === "choices") {
      this._resetChoices();
    } else {
      this._controller.value?.reset();
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
      : (this._languages.length === 1 && this._languages[0] === "js") ||
          (this._languages.includes("js") && this._languages.includes("wat"))
        ? "console"
        : "tabbed";
    if (this._template === "choices") {
      code["js-hidden"] = choiceJs;
      code["css-hidden"] = choiceStyle;
    }
    return code;
  }

  /** @param {string} lang */
  _langName(lang) {
    switch (lang) {
      case "js":
        return "JavaScript";
      default:
        return lang.toUpperCase();
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
      const code = this._choices?.at(index) ?? "";
      editorNode.value = code;

      const unsupported = !isCSSSupported(code);
      this.choiceUnsupportedMask &= ~(1 << index);
      this.choiceUnsupportedMask |= Number(unsupported) << index;
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

    const runner = this._runner.value;

    if (!runner) {
      console.error("No runner");
      return;
    }

    await Promise.all([
      runner.postMessage({ typ: "choice", code }),
      new Promise((resolve) => {
        const unsupported = !isCSSSupported(code);
        this.choiceUnsupportedMask &= ~(1 << index);
        this.choiceUnsupportedMask |= Number(unsupported) << index;
        resolve(true);
      }),
    ]);

    this.choiceSelected = index;
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

  _renderConsole() {
    return html`
      <play-controller ${ref(this._controller)}>
        <div class="template-console">
          <header>
            <h4>${decode(this.name)}</h4>
          </header>
          ${this._languages.length === 1
            ? html`<play-editor
                id="editor"
                language=${ifDefined(this._languages[0])}
              ></play-editor>`
            : html`<ix-tab-wrapper>
                ${this._languages.map(
                  (lang) => html`
                    <ix-tab id=${lang}>${this._langName(lang)}</ix-tab>
                    <ix-tab-panel id=${`${lang}-panel`}>
                      <play-editor language=${lang}></play-editor>
                    </ix-tab-panel>
                  `
                )}
              </ix-tab-wrapper>`}
          <div class="buttons">
            <button id="execute" @click=${this._run}>Run</button>
            <button id="reset" @click=${this._reset}>Reset</button>
          </div>
          <play-console id="console"></play-console>
          <play-runner
            defaults=${ifDefined(
              this._languages.includes("wat") ? "ix-wat" : undefined
            )}
          ></play-runner>
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
              defaults="ix-tabbed"
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
            <play-runner
              ${ref(this._runner)}
              defaults="ix-choice"
            ></play-runner>
          </play-controller>
        </div>
      </div>
    `;
  }

  render() {
    switch (this._template) {
      case "console":
        return this._renderConsole();
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
      this._resetChoices();
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
