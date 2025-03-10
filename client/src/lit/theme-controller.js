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
    this.initialValue = "os-default";
    this._observer = new MutationObserver(() => this._updateTheme());
    this._matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
  }

  _updateTheme() {
    /** @type {Theme[]} */
    const themes = ["os-default", "dark", "light"];
    const { classList } = document.documentElement;
    let value = themes.find((x) => classList.contains(x)) || "os-default";
    if (value === "os-default") {
      value = this._matchMedia.matches ? "dark" : "light";
    }
    const oldValue = this.value;
    this.value = value;
    this.#host.requestUpdate("ThemeController.value", oldValue);
  }

  hostConnected() {
    this._observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    this._updateTheme = this._updateTheme.bind(this);
    this._matchMedia.addEventListener("change", this._updateTheme);
    this._updateTheme();
    this.initialValue = this.value;
  }

  hostDisconnected() {
    this._observer.disconnect();
    this._matchMedia.removeEventListener("change", this._updateTheme);
  }
}
