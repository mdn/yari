import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { decode } from "he";

import { PlayEditor } from "../play/editor.js";
import { isCSSSupported } from "./utils.js";
import "../play/controller.js";
import "../play/runner.js";

import choiceJs from "./choice.js?raw";
import choiceStyle from "./choice.css?raw";

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
      __choiceSelected: { type: Number, state: true },
      __choiceUnsupportedMask: { type: Number, state: true },
    };

    /** @param {any[]} _args  */
    constructor(..._args) {
      super();
      /** @type {number} */
      this.__choiceSelected = -1;
      /** @type {number} */
      this.__choiceUnsupportedMask = 0;
    }

    /** @param {MouseEvent} event  */
    #choiceClick({ target }) {
      // TODO: use a different event handler for editor update event
      // TODO: deal with update race conditions (editor updates after user clicks on different editor)
      if (target instanceof PlayEditor) {
        const choice = target.closest(".choice");
        const choiceIndex = Array.prototype.indexOf.call(
          choice?.parentNode?.children,
          choice
        );
        this.#selectChoice(choiceIndex, target.value);
      }
    }

    #resetChoices() {
      this.__choiceSelected = -1;
      this.__choiceUnsupportedMask = 0;

      const editorNodes = Array.from(
        this.shadowRoot?.querySelectorAll("play-editor") || []
      );

      Array.from(editorNodes).forEach((editorNode, index) => {
        const code = this._choices?.at(index) ?? "";
        editorNode.value = code;

        const unsupported = !isCSSSupported(code);
        this.__choiceUnsupportedMask &= ~(1 << index);
        this.__choiceUnsupportedMask |= Number(unsupported) << index;
      });

      this.#selectChoice(0);
    }

    /**
     * @param {Number} index
     * @param {string|undefined} code
     */
    async #selectChoice(index, code = undefined) {
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
          this.__choiceUnsupportedMask &= ~(1 << index);
          this.__choiceUnsupportedMask |= Number(unsupported) << index;
          resolve(true);
        }),
      ]);

      this.__choiceSelected = index;
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
            @click=${this.#choiceClick}
            @update=${this.#choiceClick}
          >
            ${this._choices?.map(
              (code, index) => html`
                <div
                  class=${[
                    "choice",
                    ...(index === this.__choiceSelected ? ["selected"] : []),
                    ...((1 << index) & this.__choiceUnsupportedMask
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
        code["js-hidden"] = [
          choiceJs,
          `setChoice(${JSON.stringify(this._choices?.[0])})`,
        ].join("\n");
        code["css-hidden"] = choiceStyle;
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
