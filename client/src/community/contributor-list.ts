import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

interface ContributorData {
  name: string;
  github?: string;
  org?: string;
}

@customElement("contributor-list")
export class ContributorList extends LitElement {
  _contributors: ContributorData[] = [];

  static properties = {
    _contributors: { state: true },
  };

  createRenderRoot() {
    // use light DOM
    return this;
  }

  constructor() {
    super();
    const contributorList = this.querySelector("ul");
    const randomContributors: ContributorData[] = [];
    if (contributorList) {
      const contributors = [...contributorList.querySelectorAll("li")];
      for (let index = 0; index < 8; index++) {
        const contributor = popRandom(contributors);
        if (!contributor) {
          break;
        }
        const [name, github, org] = [...contributor.childNodes].map(
          (node) => node?.textContent?.trim() || undefined
        );
        if (!name) {
          index--;
          continue;
        }
        randomContributors.push({
          name,
          github,
          org,
        });
      }
      this._contributors = randomContributors;
      contributorList.remove();
    }
  }

  render() {
    return html`<ul class="rendered">
      ${this._contributors.map(({ name, github, org }) => {
        const imgSrc = `https://avatars.githubusercontent.com/${github
          ?.split("/")
          .slice(-1)}`;
        return html`<li>
          <a href="${github}">
            <img
              src="${imgSrc}?size=80"
              srcset="${imgSrc}?size=160 2x"
              loading="lazy"
            />
            ${name}
          </a>
          ${org}
        </li>`;
      })}
    </ul>`;
  }
}

function popRandom<T>(array: Array<T>) {
  const i = Math.floor(Math.random() * array.length);
  return array.splice(i, 1)[0];
}
