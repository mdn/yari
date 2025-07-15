import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { decode } from "he";

import { PlayEditor } from "../play/editor.js";
import { isCSSSupported } from "./utils.js";
import "../play/controller.js";
import "../play/runner.js";

/**
 * @import { InteractiveExampleBase } from "./index.js";
 */

/**
 * @template {new (...args: any[]) => InteractiveExampleBase} TBase
 * @param {TBase} Base
 */
export const InteractiveExampleWithChoices = (Base) =>
  class extends Base {
    static properties = {
      __choiceSelected: { state: true },
      __choiceUnsupported: { state: true },
    };

    /** @param {any[]} _args  */
    constructor(..._args) {
      super();
      /** @type {number} */
      this.__choiceSelected = -1;
      /** @type {boolean[]} */
      this.__choiceUnsupported = [];
    }

    /** @param {MouseEvent} event  */
    #choiceFocus({ target }) {
      if (target instanceof PlayEditor) {
        target.focus();
      }
    }

    /** @param {MouseEvent} event  */
    #choiceSelect({ target }) {
      if (target instanceof PlayEditor) {
        this.#updateUnsupported(target);
        this.#selectChoice(target);
      }
    }

    /** @param {Event} event  */
    #choiceUpdate({ target }) {
      if (target instanceof PlayEditor) {
        this.#updateUnsupported(target);
        if (this.__choiceSelected === this.#getIndex(target)) {
          this.#selectChoice(target);
        }
      }
    }

    #resetChoices() {
      this.__choiceSelected = -1;

      const editorNodes = Array.from(
        this.shadowRoot?.querySelectorAll("play-editor") || []
      );

      Array.from(editorNodes).forEach((editorNode, index) => {
        const code = this._choices?.at(index) ?? "";
        editorNode.value = code;
      });

      this.__choiceUnsupported =
        this._choices?.map((code) => !isCSSSupported(code || "")) || [];

      const first = editorNodes[0];
      if (first) {
        this.#selectChoice(first);
      }
    }

    /** @param {PlayEditor} editor */
    async #selectChoice(editor) {
      const index = this.#getIndex(editor);
      await this._runner.value?.postMessage({
        typ: "choice",
        code: editor.value,
      });
      this.__choiceSelected = index;
    }

    /** @param {PlayEditor} editor */
    #updateUnsupported(editor) {
      const index = this.#getIndex(editor);
      this.__choiceUnsupported = this.__choiceUnsupported.map((value, i) =>
        index === i ? !isCSSSupported(editor.value) : value
      );
    }

    /** @param {PlayEditor} editor */
    #getIndex(editor) {
      return parseInt(editor.dataset.index ?? "-1", 10);
    }

    #render() {
      return html`
        <div class="template-choices">
          <header>
            <h4>${decode(this.name)}</h4>
            <button id="reset" @click=${this._reset}>Reset</button>
          </header>
          <div
            class="choice-wrapper"
            @click=${this.#choiceFocus}
            @focus=${this.#choiceSelect}
            @update=${this.#choiceUpdate}
          >
            ${this._choices?.map(
              (code, index) => html`
                <div
                  class=${[
                    "choice",
                    ...(index === this.__choiceSelected ? ["selected"] : []),
                    ...(this.__choiceUnsupported[index] ? ["unsupported"] : []),
                  ].join(" ")}
                >
                  <play-editor
                    data-index=${index}
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

    _reset() {
      if (this._template === "choices") {
        this.#resetChoices();
      } else {
        super._reset();
      }
    }

    _initialCode() {
      const code = super._initialCode();
      if (this._template === "choices") {
        code["js-hidden"] = `setChoice(${JSON.stringify(this._choices?.[0])})`;
      }
      return code;
    }

    render() {
      return this._template === "choices" ? this.#render() : super.render();
    }

    firstUpdated() {
      super.firstUpdated();
      if (this._template === "choices") {
        this.#resetChoices();
      }
    }
  };
