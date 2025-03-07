import { LitElement } from "lit";
import { createRef } from "lit/directives/ref.js";

import { GleanMixin } from "../glean-mixin.js";
import { InteractiveExampleWithChoices } from "./with-choices.js";
import { InteractiveExampleWithConsole } from "./with-console.js";
import { InteractiveExampleWithTabs } from "./with-tabs.js";

import styles from "./index.scss?css" with { type: "css" };

/**
 * @import { Ref } from 'lit/directives/ref.js';
 * @import { PlayController } from "../play/controller.js";
 * @import { PlayRunner } from "../play/runner.js";
 */

const LANGUAGE_CLASSES = ["html", "js", "css", "wat"];
const GLEAN_EVENT_TYPES = ["focus", "copy", "cut", "paste", "click"];

export class InteractiveExampleBase extends GleanMixin(LitElement) {
  static properties = { name: { type: String } };

  static styles = styles;

  constructor() {
    super();
    this.name = "";
    /** @type {string[]} */
    this._languages = [];
    /** @type {Record<string, string>} */
    this._code = {};
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

  firstUpdated() {
    if (this._controller.value) {
      this._controller.value.code = this._code;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    GLEAN_EVENT_TYPES.forEach((type) => {
      this.renderRoot.removeEventListener(type, this._telemetryHandler);
    });
  }
}

export class InteractiveExample extends InteractiveExampleWithChoices(
  InteractiveExampleWithTabs(
    InteractiveExampleWithConsole(InteractiveExampleBase)
  )
) {}

customElements.define("interactive-example", InteractiveExample);
