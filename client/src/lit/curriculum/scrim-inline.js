import { html, LitElement, nothing } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createComponent } from "@lit/react";
import React from "react";
import { CURRICULUM } from "../../telemetry/constants.ts";
import { GleanMixin } from "../glean-mixin.js";

import "./scrim-inline.global.css";
import styles from "./scrim-inline.scss?css" with { type: "css" };
import playSvg from "../../assets/curriculum/scrim-play.svg?raw";

export class ScrimInline extends GleanMixin(LitElement) {
  static properties = {
    url: { type: String },
    img: { type: String },
    scrimTitle: { type: String, attribute: "scrimtitle" },
    survey: { type: Boolean },
    _fullscreen: { state: true },
    _scrimLoaded: { state: true },
    _voted: { state: true },
  };

  static styles = styles;

  constructor() {
    super();
    /** @type {string | undefined} */
    this.url = undefined;
    /** @type {string | undefined} */
    this._fullUrl = undefined;
    /** @type {string | undefined} */
    this._scrimId = undefined;

    /** @type {string | undefined} */
    this.img = undefined;
    /** @type {import("lit/directives/style-map.js").StyleInfo} */
    this._imgStyle = {};

    /** @type {string | undefined} */
    this.scrimTitle = undefined;

    /** @type {boolean} */
    this._fullscreen = false;
    /** @type {boolean} */
    this._scrimLoaded = false;

    /** @type {boolean} */
    this.survey = false;
    /** @type {boolean} */
    this._voted = false;
  }

  /**
   * @param {import("lit").PropertyValues<this>} changedProperties
   */
  willUpdate(changedProperties) {
    if (changedProperties.has("url")) {
      if (this.url) {
        const url = new URL(this.url);
        url.searchParams.set("via", "mdn");
        url.searchParams.set("embed", "");
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

  /**
   * @param {MouseEvent} event
   */
  _handleVote({ target }) {
    if (target instanceof HTMLElement) {
      const vote = target.dataset.vote;
      const label = vote === "better" ? "1" : vote === "worse" ? "-1" : "0";
      this._voted = true;
      this._gleanClick(`scrimba-challenges-survey: ${label}`);
    }
  }

  _hideSurvey() {
    this.removeAttribute("survey");
  }

  _renderSurvey() {
    if (!this.survey) {
      return nothing;
    }
    return html`<div class="survey">
      <button type="button" class="hide-survey" @click=${this._hideSurvey}>
        <span class="icon icon-close"> </span>
      </button>
      ${this._voted
        ? html`<div class="voted">Thank you for your feedback! ❤️</div>`
        : html`
            <div class="context-text">
              We’re testing a new type of challenge and would love your
              feedback.
            </div>
            <fieldset class="feedback">
              <label>
                How does this Scrim challenge compare to other tasks on this
                page?
              </label>
              <div class="button-container">
                <button
                  type="button"
                  class="button primary yes"
                  @click=${this._handleVote}
                >
                  <span class="button-wrap" data-vote="better">Better</span>
                </button>
                <button
                  type="button"
                  class="button primary same"
                  @click=${this._handleVote}
                >
                  <span class="button-wrap" data-vote="same"
                    >About the same</span
                  >
                </button>
                <button
                  type="button"
                  class="button primary no"
                  @click=${this._handleVote}
                >
                  <span class="button-wrap" data-vote="worse">Worse</span>
                </button>
              </div>
            </fieldset>
          `}
    </div>`;
  }

  render() {
    if (!this.url || !this._fullUrl) {
      return nothing;
    }

    return html`
      <dialog @close=${this.#dialogClosed} style=${styleMap(this._imgStyle)}>
        <div class="inner">
          <div class="header">
            <span>Clicking will load content from scrimba.com</span>
            <button tabindex="0" @click=${this.#toggle} class="toggle">
              <div
                class="scrim-fullscreen ${this._fullscreen ? "exit" : "enter"}"
              ></div>
              <span class="visually-hidden">Toggle fullscreen</span>
            </button>
            <a
              href=${this._fullUrl}
              target="_blank"
              rel="origin noreferrer"
              class="external"
              data-glean="${CURRICULUM}: scrim link id:${this._scrimId}"
            >
              <div class="scrim-link"></div>
              <span class="visually-hidden">Open on Scrimba</span>
            </a>
          </div>
          <div class="body">
            ${this._scrimLoaded
              ? html`
                  <iframe
                    src=${this._fullUrl}
                    title=${ifDefined(this.scrimTitle)}
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
                    @click=${this.#open}
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
          ${this._renderSurvey()}
        </div>
      </dialog>
    `;
  }

  /**
   * @param {MouseEvent} e
   */
  #toggle(e) {
    if (e.target instanceof HTMLElement) {
      e.target.dataset.glean = `${CURRICULUM}: scrim fullscreen -> ${this._fullscreen ? 0 : 1} id:${this._scrimId}`;
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

customElements.define("scrim-inline", ScrimInline);

export default createComponent({
  tagName: "scrim-inline",
  elementClass: ScrimInline,
  react: React,
});
