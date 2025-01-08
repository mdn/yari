/**
 * @import { LitElement } from "lit";
 * @import { Theme } from "../types/theme";
 */

/**
 * Requests a Lit update when the theme changes,
 * with a "ThemeController.value" changed property in `willUpdate`.
 * Current theme can be accessed through `.value`.
 */
export class ThemeController {
  #host;

  /** @param {LitElement} host */
  constructor(host) {
    this.#host = host;
    this.#host.addController(this);
    /** @type {Theme} */
    this.value = "os-default";
    this._observer = new MutationObserver(() => this.#updateTheme());
  }

  #updateTheme() {
    /** @type {Theme[]} */
    const themes = ["os-default", "dark", "light"];
    const { classList } = document.documentElement;
    const oldValue = this.value;
    this.value = themes.find((x) => classList.contains(x)) || "os-default";
    this.#host.requestUpdate("ThemeController.value", oldValue);
  }

  hostConnected() {
    this._observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    this.#updateTheme();
  }

  hostDisconnected() {
    this._observer.disconnect();
  }
}
