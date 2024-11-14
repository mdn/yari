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
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected firstUpdated(): void {
    if (this.renderRoot instanceof HTMLElement) {
      this.renderRoot.tabIndex = 0;

      const hx = this.renderRoot.querySelector("h4, h5");
      const panel = hx?.closest(".tabpanel");
      if (hx && panel) {
        const id = panel.id.replace("-panel", "");
        this.renderRoot.id = `${id}_${hx.id}`;
      }

      this.renderRoot.addEventListener("focus", ({ currentTarget }) => {
        if (currentTarget instanceof HTMLElement) {
          window.history.pushState({}, "", `#${currentTarget.id}`);
          currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }
  }
}