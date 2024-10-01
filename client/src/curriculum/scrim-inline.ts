import { html, LitElement, PropertyValues } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { StyleInfo, styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createComponent } from "@lit/react";
import React from "react";
import { CURRICULUM } from "../telemetry/constants";

import "./scrim-inline.global.css";
import styles from "./scrim-inline.scss?css" with { type: "css" };
import playSvg from "../assets/curriculum/scrim-play.svg?raw";

@customElement("scrim-inline")
class ScrimInline extends LitElement {
  url?: string;
  _fullUrl?: string;
  _scrimId?: string;

  img?: string;
  _imgStyle: StyleInfo = {};

  scrimTitle?: string;

  _fullscreen = false;
  _scrimLoaded = false;

  static properties = {
    url: { type: String },
    img: { type: String },
    scrimTitle: { type: String },
    _fullscreen: { state: true },
    _scrimLoaded: { state: true },
  };

  static styles = styles;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("url")) {
      if (this.url) {
        const url = new URL(this.url);
        url.searchParams.set("via", "mdn");
        this._fullUrl = url.toString();

        this._scrimId = url.pathname.slice(1);
      } else {
        this._fullUrl = undefined;
        this._scrimId = undefined;
      }
    }

    if (changedProperties.has("img")) {
      this._imgStyle = this.img
        ? {
            "--scrim-img": `url(${this.img})`,
          }
        : {};
    }
  }

  render() {
    if (!this.url || !this._fullUrl) {
      return html``;
    }

    return html`
      <dialog @close=${this.#dialogClosed} style=${styleMap(this._imgStyle)}>
        <div class="inner">
          <div class="header">
            <span>Clicking will load content from scrimba.com</span>
            <button
              tabindex="0"
              @click="${this.#toggle}"
              class="toggle ${this._fullscreen ? "exit" : "enter"}"
            >
              <span class="visually-hidden">Toggle fullscreen</span>
            </button>
            <a
              href="${this._fullUrl}"
              target="_blank"
              rel="origin noreferrer"
              class="external"
            >
              <span class="visually-hidden">Open on Scrimba</span>
            </a>
          </div>
          <div class="body">
            ${this._scrimLoaded
              ? html`
                  <iframe
                    src="${this._fullUrl}"
                    title="${ifDefined(this.scrimTitle)}"
                  ></iframe>
                `
              : html`
                  ${this.scrimTitle && !this.img
                    ? html`<div class="background">
                        <div class="background-noise">
                          <svg width="0" height="0">
                            <filter id="noise">
                              <feTurbulence
                                type="fractalNoise"
                                baseFrequency="0.7"
                                numOctaves="4"
                              />
                            </filter>
                          </svg>
                        </div>
                        <h1>${this.scrimTitle}</h1>
                      </div>`
                    : null}
                  <button
                    @click="${this.#open}"
                    class="open"
                    data-glean=${`${CURRICULUM}: scrim engage id:${this._scrimId}`}
                  >
                    ${unsafeHTML(playSvg)}
                    <span class="visually-hidden">
                      "Load scrim and open dialog."
                    </span>
                  </button>
                `}
          </div>
        </div>
      </dialog>
    `;
  }

  #toggle(e: MouseEvent) {
    if (e.target) {
      (e.target as HTMLElement).dataset.glean =
        `${CURRICULUM}: scrim fullscreen -> ${this._fullscreen ? 0 : 1} id:${this._scrimId}`;
    }
    if (this._fullscreen) {
      this.#close();
    } else {
      this.#open();
    }
  }

  #open() {
    const dialog = this.renderRoot.querySelector("dialog");
    if (dialog) {
      dialog.showModal();
      this._scrimLoaded = true;
      this._fullscreen = true;
    }
  }

  #close() {
    const dialog = this.renderRoot.querySelector("dialog");
    dialog?.close();
  }

  #dialogClosed() {
    this._fullscreen = false;
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "scrim-inline": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export default createComponent({
  tagName: "scrim-inline",
  elementClass: ScrimInline,
  react: React,
});
