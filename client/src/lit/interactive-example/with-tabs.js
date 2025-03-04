import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { decode } from "he";

import "../play/controller.js";
import "../play/editor.js";
import "../play/runner.js";
import "./tabs.js";

/**
 * @import { InteractiveExampleBase } from ".";
 */

/**
 * @template {new (...args: any[]) => InteractiveExampleBase} TBase
 * @param {TBase} Base
 */
export const InteractiveExampleWithTabs = (Base) =>
  class extends Base {
    #render() {
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

    render() {
      return this._template === "tabbed" ? this.#render() : super.render();
    }
  };
