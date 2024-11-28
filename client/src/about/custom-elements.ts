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

  _focus({ currentTarget }) {
    if (currentTarget instanceof HTMLElement) {
      window.history.pushState({}, "", `#${currentTarget.id}`);
      this.classList.add("open");
      this.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  _focusout({ relatedTarget }) {
    if (!(relatedTarget instanceof Node && this.contains(relatedTarget))) {
      this.classList.remove("open");
    }
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.tabIndex = 0;
    this._setID();
    this.addEventListener("focus", this._focus);
    this.addEventListener("focusout", this._focusout);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("focus", this._focus);
    this.removeEventListener("focusout", this._focusout);
  }
}
