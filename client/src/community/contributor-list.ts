import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import styles from "./contributor-list.scss?css" with { type: "css" };

interface ContributorData {
  name: string;
  github: string;
  org?: string;
}

@customElement("contributor-list")
export class ContributorList extends LitElement {
  _contributors: ContributorData[] = [];

  static properties = {
    _contributors: { state: true },
  };

  static styles = styles;

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
        if (!name || !github) {
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
    }
  }

  render() {
    return html`<div class="wrap">
      <div class="inner">
        <ul>
          <svg>
            <defs>
              <mask id="hide-half">
                <rect
                  x="0%"
                  y="0%"
                  width="100%"
                  height="100%"
                  fill="#fff"
                  stroke="#fff"
                />
              </mask>
            </defs>
            <ellipse
              rx="100%"
              ry="50%"
              cx="100%"
              cy="50%"
              mask="url(#hide-half)"
            />
            <ellipse
              rx="50%"
              ry="25%"
              cx="100%"
              cy="50%"
              mask="url(#hide-half)"
            />
          </svg>
          ${this._contributors.map(({ name, github, org }) => {
            const imgSrc = `https://avatars.githubusercontent.com/${github
              ?.split("/")
              .slice(-1)}`;
            return html`<li>
              <a href="${github}" target="_blank" rel="nofollow noreferrer">
                <img
                  src="${imgSrc}?size=80"
                  srcset="${imgSrc}?size=160 2x"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                ${name}
              </a>
              <span class="org">${org}</span>
            </li>`;
          })}
        </ul>
      </div>
    </div>`;
  }
}

function popRandom<T>(array: Array<T>) {
  const i = Math.floor(Math.random() * array.length);
  // mutate the array:
  return array.splice(i, 1)[0];
}
