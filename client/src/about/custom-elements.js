import { LitElement } from "lit";

export class MDNImageHistory extends LitElement {
  createRenderRoot() {
    return this;
  }

  firstUpdated() {
    this.renderRoot.querySelectorAll("img").forEach((img) => {
      const regex = /@([0-9]+(?:\.[0-9]+)?)(?=x\.[a-z]+$)/;
      const match = img.src.match(regex);
      if (match?.[1]) {
        const baseRes = parseFloat(match[1]);
        const dpis = [1, 2];
        img.srcset = dpis
          .map(
            (dpi) => `${img.src.replace(regex, `@${baseRes * dpi}`)} ${dpi}x`
          )
          .join(", ");
      }
    });
  }
}

customElements.define("mdn-image-history", MDNImageHistory);

export class TeamMember extends LitElement {
  _setID() {
    const hx = this.querySelector("h4, h5");
    const panel = hx?.closest(".tabpanel");
    if (hx && panel) {
      const id = `${panel.id.replace("-panel", "")}_${hx.id}`;
      if (this.id !== id) {
        this.id = id;
      }
    }
  }

  /** @param {FocusEvent} ev */
  _focusin({ currentTarget }) {
    if (currentTarget instanceof HTMLElement) {
      window.history.pushState({}, "", `#${currentTarget.id}`);
      this.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  _focusout() {
    const hx = this.querySelector("h4, h5");
    const panel = hx?.closest(".tabpanel");
    window.history.pushState({}, "", `#${panel?.id || ""}`);
  }

  createRenderRoot() {
    return this;
  }

  /** @param {MouseEvent} ev */
  _mousedown(ev) {
    if (ev?.target?.tagName === "A") {
      ev?.preventDefault?.();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.tabIndex = 0;
    this._setID();
    if (window.location.hash === `#${this.id}`) {
      setTimeout(() => this.focus(), 100);
    }
    this.addEventListener("mousedown", this._mousedown);
    this.addEventListener("focusin", this._focusin);
    this.addEventListener("focusout", this._focusout);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("mousedown", this._mousedown);
    this.removeEventListener("focusin", this._focusin);
    this.removeEventListener("focusout", this._focusout);
  }
}

customElements.define("team-member", TeamMember);
