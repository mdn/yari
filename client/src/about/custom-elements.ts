import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("mdn-image-history")
export class MDNImageHistory extends LitElement {
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected firstUpdated(): void {
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

@customElement("team-member")
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

  _focusin({ currentTarget }) {
    if (currentTarget instanceof HTMLElement) {
      window.history.pushState({}, "", `#${currentTarget.id}`);
      this.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  _focusout({ relatedTarget }) {
    const hx = this.querySelector("h4, h5");
    const panel = hx?.closest(".tabpanel");
    window.history.pushState({}, "", `#${panel?.id || ""}`);
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.tabIndex = 0;
    this._setID();
    if (window.location.hash === `#${this.id}`) {
      setTimeout(() => this.focus(), 100);
    }
    this.addEventListener("focusin", this._focusin);
    this.addEventListener("focusout", this._focusout);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("focusin", this._focusin);
    this.removeEventListener("focusout", this._focusout);
  }
}
