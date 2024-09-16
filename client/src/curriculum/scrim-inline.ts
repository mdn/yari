import { css, html, LitElement, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { styleMap } from "lit/directives/style-map.js";
import { createComponent } from "@lit/react";
import React from "react";
import { CURRICULUM } from "../telemetry/constants";

import externalIcon from "../assets/icons/external.svg?url";
import fullscreenIcon from "../assets/icons/fullscreen-enter.svg?url";
import cancelIcon from "../assets/icons/cancel.svg?url";
import backgroundImg from "../assets/curriculum/scrim-bg.png";
import playSvg from "../assets/curriculum/scrim-play.svg?raw";

@customElement("scrim-inline")
class ScrimInline extends LitElement {
  url?: string;
  img?: string;
  _fullscreen = false;
  _scrimLoaded = false;

  static properties = {
    url: { type: String },
    img: { type: String },
    _fullscreen: { state: true },
    _scrimLoaded: { state: true },
  };

  static styles = css`
    * {
      box-sizing: border-box;
    }

    .visually-hidden {
      border: 0 !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
      height: 1px !important;
      margin: -1px !important;
      overflow: hidden !important;
      padding: 0 !important;
      position: absolute !important;
      white-space: nowrap !important;
      width: 1px !important;
    }

    button {
      appearance: none;
      background: none;
      border: none;
      padding: 0;
    }

    dialog {
      display: contents;

      &[open] {
        background-color: #0009;
        height: 90vh;
        width: 90vw;
      }
    }

    .inner {
      background-color: #000;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .header {
      align-items: center;
      display: flex;
      gap: 0.25rem;
      margin: 0;
      padding: 0 0.5rem;
      width: 100%;
      min-height: 1.75rem;

      span {
        color: #fff;
        font-size: var(--type-tiny-font-size);
        margin-right: auto;
      }
    }

    .toggle,
    .external {
      background-color: #fff;
      cursor: pointer;
      height: 1rem;
      width: 1rem;
      mask-size: contain;
      mask-position: center;
      mask-repeat: no-repeat;

      &:hover {
        background-color: var(--curriculum-color);
      }

      &:focus-visible {
        outline-color: var(--accent-primary);
        outline-offset: 1px;
        outline-style: auto;
      }
    }

    .toggle {
      &.enter {
        mask-image: url(${unsafeCSS(fullscreenIcon)});
      }

      &.exit {
        mask-image: url(${unsafeCSS(cancelIcon)});
      }
    }

    .external {
      mask-image: url(${unsafeCSS(externalIcon)});
      mask-size: 75%;
    }

    .open,
    iframe {
      border: 1px solid #000;
      width: 100%;
      height: 100%;
    }

    .open {
      --color: #8cb4ffcc;
      cursor: pointer;
      background-image: var(--img, url(${unsafeCSS(backgroundImg)}));
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;

      &:hover {
        --color: #8cb4ffe5;
      }

      svg {
        height: 7rem;
        width: 7rem;
        stroke-width: 2px;

        circle {
          fill: var(--color);
        }

        path {
          fill: #fff;
        }
      }
    }
  `;

  render() {
    if (!this.url) {
      return html``;
    }

    const styles = this.img
      ? {
          "--img": `url(${this.img})`,
        }
      : {};

    const url = new URL(this.url);
    url.searchParams.set("via", "mdn");

    return html`
      <dialog @close=${this.#dialogClosed} style=${styleMap(styles)}>
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
              href="${url.toString()}"
              target="_blank"
              rel="origin noreferrer"
              class="external"
            >
              <span class="visually-hidden">Open on Scrimba</span>
            </a>
          </div>
          ${this._scrimLoaded
            ? html`
                <iframe
                  src="${url.toString()}"
                  title="MDN + Scrimba partnership announcement scrim"
                ></iframe>
              `
            : html`
                <button
                  @click="${this.#open}"
                  class="open"
                  data-glean=${`${CURRICULUM}: scrim engage`}
                >
                  ${unsafeHTML(playSvg)}
                  <span class="visually-hidden">
                    "Load scrim and open dialog."
                  </span>
                </button>
              `}
        </div>
      </dialog>
    `;
  }

  #toggle(e: MouseEvent) {
    if (e.target) {
      (e.target as HTMLElement).dataset.glean =
        `${CURRICULUM}: scrim fullscreen -> ${this._fullscreen ? 0 : 1}`;
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
