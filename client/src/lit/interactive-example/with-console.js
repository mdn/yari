import { html } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { ref } from "lit/directives/ref.js";
import { decode } from "he";

import "../play/controller.js";
import "../play/editor.js";
import "../play/runner.js";
import "../play/console.js";
import "./tabs.js";

/**
 * @import { InteractiveExampleBase } from ".";
 */

/**
 * @template {new (...args: any[]) => InteractiveExampleBase} TBase
 * @param {TBase} Base
 */
export const InteractiveExampleWithConsole = (Base) =>
  class extends Base {
    #render() {
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

    render() {
      return this._template === "console" ? this.#render() : super.render();
    }
  };
