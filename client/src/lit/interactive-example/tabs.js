import { html, LitElement } from "lit";

import wrapperStyles from "./tabs.wrapper.scss?css" with { type: "css" };
import tabStyles from "./tabs.tab.scss?css" with { type: "css" };
import panelStyles from "./tabs.panel.scss?css" with { type: "css" };

/**
 * @typedef {"first" | "prev" | "active" | "next" | "last"} Position
 */

export class TabWrapper extends LitElement {
  static styles = wrapperStyles;

  /** @param {Position} position */
  _getTab(position) {
    const tabs = Array.from(this.querySelectorAll("ix-tab"));
    if (position === "first") {
      return tabs[0];
    }
    if (position === "last") {
      return tabs.at(-1);
    }
    const active = tabs.findIndex((tab) => tab.isActive);
    if (position === "active") {
      return tabs[active];
    }
    if (position === "prev") {
      return tabs.at((active - 1) % tabs.length);
    }
    if (position === "next") {
      return tabs.at((active + 1) % tabs.length);
    }
    return undefined;
  }

  /**@param {Tab | undefined} tab */
  _setTabActive(tab, focus = false) {
    if (!tab) {
      return;
    }
    this._getTab("active")?.unsetActive();
    tab.setActive();
    if (focus) {
      tab.focus();
    }
  }

  /** @param {MouseEvent} event */
  _tablistClick({ target }) {
    if (target instanceof HTMLElement) {
      const tab = target.closest("ix-tab") || undefined;
      this._setTabActive(tab);
    }
  }

  /** @param {KeyboardEvent} event */
  _tablistKeyDown(event) {
    /** @type {Position | undefined} */
    let position;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        position = "next";
        break;
      case "ArrowLeft":
      case "ArrowUp":
        position = "prev";
        break;
      case "Home":
        position = "first";
        break;
      case "End":
        position = "last";
        break;
      default:
        return;
    }
    event.preventDefault();
    this._setTabActive(this._getTab(position), true);
  }

  render() {
    return html`
      <div id="tablist" role="tablist">
        <slot
          name="tablist"
          @click=${this._tablistClick}
          @keydown=${this._tablistKeyDown}
        ></slot>
      </div>
      <slot name="active-panel"></slot>
    `;
  }

  firstUpdated() {
    this.querySelector("ix-tab")?.setActive();
  }
}

customElements.define("ix-tab-wrapper", TabWrapper);

export class Tab extends LitElement {
  static styles = tabStyles;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("slot", "tablist");
    this.setAttribute("role", "tab");
    this.unsetActive();
    const panel = this.nextElementSibling;
    if (panel instanceof TabPanel) {
      this.panel = panel;
      if (panel.id) {
        this.setAttribute("aria-controls", panel.id);
      }
      if (this.id) {
        panel.setAttribute("aria-labelledby", this.id);
      }
    }
  }

  setActive() {
    this.setAttribute("tabindex", "0");
    this.setAttribute("aria-selected", "true");
    this.panel?.setActive();
  }

  unsetActive() {
    this.setAttribute("tabindex", "-1");
    this.setAttribute("aria-selected", "false");
    this.panel?.unsetActive();
  }

  get isActive() {
    return this.getAttribute("aria-selected") === "true";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("ix-tab", Tab);

export class TabPanel extends LitElement {
  static styles = panelStyles;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "tabpanel");
  }

  setActive() {
    this.setAttribute("slot", "active-panel");
  }

  unsetActive() {
    this.removeAttribute("slot");
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("ix-tab-panel", TabPanel);
