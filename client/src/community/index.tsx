import { ReactComponent as Header1 } from "./svg/header-1.svg";
import { ReactComponent as Header2 } from "./svg/header-2.svg";
import { ReactComponent as Header3 } from "./svg/header-3.svg";
import { ReactComponent as MobileHeaderSVG } from "./svg/header-mobile.svg";
import { ReactComponent as VideoPreviewSVG } from "./svg/video-preview.svg";

import "./index.scss";

const STATS = [
  { id: 1, number: "45k+", legend: "Total contributors" },
  { id: 2, number: "80M+", legend: "Monthly views" },
  { id: 3, number: "200+", legend: "Weekly commits" },
  { id: 4, number: "8", legend: "Language communities" },
];
const LOCALE_COUNT = 9;

export function Community() {
  return (
    <main className="contribute">
      {/* 1. Header */}
      <section className="community-header">
        <h1>MDN Community</h1>
        <p>Contribute, Collaborate and Shape the Future of the Web Together</p>
        <a href="#join">Start Contributing on GitHub</a>
        <a href="https://developer.mozilla.org/discord">Join MDN Discord</a>
        <div className="illustration mobile-only">
          <MobileHeaderSVG role="none" />
        </div>
        <div className="desktop-only">
          <Header1 />
          <Header2 />
          <Header3 />
        </div>
      </section>
      {/* 2. Stats */}
      <section className="community-stats">
        <ul className="stats">
          {STATS.map((s) => (
            <li key={s.id}>
              <span className="number">{s.number}</span>
              <span className="legend">{s.legend}</span>
            </li>
          ))}
        </ul>
        <h2>MDN community powers the web</h2>
        <p>
          MDN’s strength comes from the passion and dedication of our global
          community. Since our founding in 2005, we’ve grown into a thriving
          network. Together, we’ve created a comprehensive, open, and free
          resource that serves web developers across the globe. With volunteers
          leading translation efforts in {LOCALE_COUNT} languages, we’re truly
          international.
        </p>
      </section>
      {/* 3. Contributors */}
      <section className="community-contributors">
        <section className="contributors">{/* Left column. */}</section>
        <section className="meet-our-contributors">
          {/* Right column, top. */}
          <p>
            We are an open-source community of developers dedicated to building
            resources for a better web. Our diverse contributors, including
            developers, technical writers, students, educators, designers, and
            more, come from various backgrounds and platforms. Anyone can
            contribute, and each contribution strengthens our community, driving
            innovation and improving this vital resource for developers
            worldwide
          </p>
          <div className="actions">
            <a href="https://developer.mozilla.org/en-US/docs/MDN/Community/Contributing/Getting_started">
              Join us
            </a>
            <a
              href="https://github.com/mdn/content/graphs/contributors"
              className="view-all"
            >
              View all contributors
            </a>
          </div>
        </section>
        <section className="contributor-spotlight">
          {/* Right column, bottom. */}
          <h2>Contributor spotlight</h2>
          <div className="quotes">
            <blockquote>
              <p>
                MDN Web Docs has the most up-to-date and accurate information
                and the content is presented in an easy-to-understand manner. I
                also like that it's available in many languages (very
                important!)
              </p>
              <span>
                -Yuji
                <br />
                (MDN contributor)
              </span>
            </blockquote>
            <blockquote>
              <p>
                MDN Web Docs has the most up-to-date and accurate information
                and the content is presented in an easy-to-understand manner. I
                also like that it's available in many languages (very
                important!)
              </p>
              <span>
                -Yuji
                <br />
                (MDN contributor)
              </span>
            </blockquote>
            <blockquote>
              <p>
                MDN Web Docs has the most up-to-date and accurate information
                and the content is presented in an easy-to-understand manner. I
                also like that it's available in many languages (very
                important!)
              </p>
              <span>
                -Yuji
                <br />
                (MDN contributor)
              </span>
            </blockquote>
          </div>
        </section>
      </section>
      {/* 4. Learn how to get started */}
      <section className="get-started">
        <h2>Learn how to get started</h2>
        <p>
          We collaborate on <a href="https://github.com/mdn">GitHub</a>, our
          project's home, on various tasks such as writing and improving
          documentation, fixing bugs, and providing review feedback. It starts
          here, with you. Want to start right away, but not sure how? Follow our
          guide to{" "}
          <a href="https://github.com/mdn/content/blob/main/CONTRIBUTING.md#mdn-web-docs-contribution-guide">
            make your first contribution
          </a>
          .
        </p>
        <figure>
          <a href="https://youtu.be/Xnhnu7PViQE?si=RDDlAqtx-CEKXtFL">
            <VideoPreviewSVG />
          </a>
          <figcaption>
            Watch this video on{" "}
            <a href="https://youtu.be/Xnhnu7PViQE?si=RDDlAqtx-CEKXtFL">
              how to get started with contributing to MDN Web Docs
            </a>
          </figcaption>
        </figure>
      </section>
      {/* 5. Join us in shaping a better web */}
      <section id="join" className="join-us">
        <h2>Join us in shaping a better web</h2>
        <p>
          Become part of this globally cherished group that’s dedicated to
          documenting web technologies. Whether you’re an expert or a beginner,
          there’s a place for you in our inclusive community. Check out some of
          the ways you can contribute and engage.
        </p>
        <ul className="notes">
          <li>
            <h3>Fix issues</h3>
            <p>Submit pull requests to fix reported issues.</p>
            <a href="https://github.com/mdn/content/issues">Squash bugs</a>
          </li>
          <li>
            <h3>Improve content</h3>
            <p>Fix inaccuracies and fill in missing information.</p>
            <a href="https://github.com/mdn/content/#readme">Start writing</a>
          </li>
          <li>
            <h3>Localize content</h3>
            <p>
              Participate in translating content into one of our supported
              languages.
            </p>
            <a href="https://developer.mozilla.org/en-US/docs/MDN/Community/Contributing/Translated_content#active_locales">
              Find your locale
            </a>
          </li>
          <li>
            <h3>Answer questions</h3>
            <p>Share your knowledge and expertise and guide fellow learners.</p>
            <a href="https://discord.gg/3MKbs99V4F">Help on Discord</a>
          </li>
          <li>
            <h3>Talk about MDN</h3>
            <p>Share your stories with us on our Mastodon or X.</p>
            <a href="https://twitter.com/mozdevnet">X</a>{" "}
            <a href="https://mozilla.social/@mdn">Mastodon</a>
          </li>
        </ul>
      </section>
      {/* 6. Get involved */}
      <section className="community-get-involved">
        <h2>Get involved</h2>
        <p>
          If you’re a beginner and looking for ways to contribute, GitHub issues
          labeled as “good first issue” and “accepting PR” are a good place to
          start.
        </p>
        <table>
          <thead>
            <tr>
              <th>Issue</th>
              <th>Title</th>
              <th>Repositories</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>288</td>
              <td>
                <span>add more details to min-width: auto section</span>
                <div className="labels">
                  <span>enhancements</span>
                  <span>good first issues</span>
                </div>
              </td>
              <td>Content Repository</td>
            </tr>
            <tr>
              <td>288</td>
              <td>
                <span>add more details to min-width: auto section</span>
                <div className="labels">
                  <span>enhancements</span>
                  <span>good first issues</span>
                </div>
              </td>
              <td>Content Repository</td>
            </tr>
          </tbody>
        </table>
        <p>
          While working Mozilla spaces, and communities, please adhere to the{" "}
          <a href="https://www.mozilla.org/en-US/about/governance/policies/participation/">
            Mozilla Community Participation Guidelines
          </a>
          , which promote respect, inclusion, and a harassment-free environment
          for all community members.
        </p>
      </section>
      {/* 7. Join the conversation */}
      <section className="join-the-conversation">
        <h2>Join the conversation</h2>
        <div className="channels">
          <figure className="chat">
            <svg
              width="82"
              height="81"
              viewBox="0 0 82 81"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="57" cy="25" r="25" fill="#E2FFD5" />
              <path
                d="M73.833 62.9967C79.0466 58.5116 81.9988 52.5334 81.9988 46.3296C81.9988 39.7365 78.8012 33.5705 72.9948 28.9663C67.3437 24.4868 59.8636 22.0195 51.9316 22.0195C43.9995 22.0195 36.5195 24.4868 30.8693 28.9667C25.0629 33.5705 21.8652 39.7365 21.8652 46.3296C21.8652 52.9227 25.0629 59.0888 30.8693 63.6929C36.5195 68.1727 43.9995 70.6399 51.9316 70.6399C52.9885 70.6399 54.0519 70.5949 55.1065 70.5053L56.9081 72.0126C63.1147 77.2039 71.052 80.0618 79.2646 80.0621H81.9979V74.4463L81.1974 73.6738C78.0395 70.6166 75.5369 66.9884 73.833 62.9967ZM60.4884 68.0248L56.8734 65.0005L55.668 65.1432C54.4283 65.2895 53.1805 65.3629 51.9316 65.363C38.3676 65.363 27.3318 56.8246 27.3318 46.3296C27.3318 35.8346 38.3676 27.2961 51.9316 27.2961C65.4956 27.2961 76.5313 35.8345 76.5313 46.3296C76.5313 51.5584 73.8288 56.4399 68.9215 60.0748L67.3473 61.2408L68.0736 63.2253C69.5622 67.2783 71.7502 71.0591 74.5451 74.4079C69.3403 73.5693 64.4761 71.3605 60.4884 68.0248Z"
                fill="#00D230"
              />
              <path
                d="M7.54819 50.6255C10.1068 47.4993 12.1157 43.9885 13.4945 40.2334L14.2154 38.2588L12.6426 37.0937C8.01507 33.6662 5.46661 29.066 5.46661 24.1405C5.46661 14.2429 15.8889 6.19066 28.6997 6.19066C38.1241 6.19066 46.2556 10.5488 49.896 16.7933C50.5719 16.7617 51.2508 16.7438 51.9328 16.7438C53.3025 16.7438 54.6597 16.808 56.0044 16.9363C54.5976 13.4183 52.1544 10.2068 48.7953 7.54377C43.4035 3.26858 36.2675 0.914062 28.6997 0.914062C21.1319 0.914062 13.9959 3.26858 8.60376 7.54377C3.05549 11.943 0 17.8371 0 24.1405C0 30.0437 2.79344 35.7317 7.73013 40.0103C6.11908 43.7526 3.76505 47.1544 0.800688 50.0241L0 50.7968V56.3183H2.7333C7.78771 56.3177 12.7726 55.1816 17.2934 52.9998C16.7977 51.1862 16.5073 49.326 16.4272 47.452C13.6832 49.0042 10.6778 50.0785 7.54819 50.6255Z"
                fill="#00D230"
              />
            </svg>

            <figcaption>
              <h3>Chat with us on Discord</h3>
              <p>
                Connect with the community. Engage with domain experts. Help
                others learn.
              </p>
              <a href="https://developer.mozilla.org/discord">
                Join MDN Discord
              </a>
            </figcaption>
          </figure>
          <figure className="call">
            <svg
              width="95"
              height="56"
              viewBox="0 0 95 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="70" cy="25" r="25" fill="#E2FFD5" />
              <path
                d="M68.3333 1C72.0917 1 75.1667 4.04083 75.1667 7.83333V42C75.1667 45.7925 72.1258 48.8333 68.3333 48.8333H82V55.6667H0V48.8333H13.6667C9.90833 48.8333 6.83333 45.7925 6.83333 42V7.83333C6.83333 4.04083 9.87417 1 13.6667 1H68.3333ZM68.3333 7.83333H13.6667V42H68.3333V7.83333ZM41 28.3333C48.5508 28.3333 54.6667 31.4083 54.6667 35.1667V38.5833H27.3333V35.1667C27.3333 31.4083 33.4492 28.3333 41 28.3333ZM41 11.25C44.7925 11.25 47.8333 14.325 47.8333 18.0833C47.8333 21.8417 44.7925 24.9167 41 24.9167C37.2075 24.9167 34.1667 21.8758 34.1667 18.0833C34.1667 14.2908 37.2417 11.25 41 11.25Z"
                fill="#00D230"
              />
            </svg>

            <figcaption>
              <h3>Join our Community Calls</h3>
              <p>
                Every month, get exclusive updates from the MDN team. Share your
                ideas and contributions.
              </p>
              <a href="https://github.com/mdn/community-meetings?tab=readme-ov-file#mdn-community-meetings">
                RSVP to the next community call
              </a>
            </figcaption>
          </figure>
        </div>
      </section>
      {/* 8. Celebrating community’s impact */}
      <section className="celebrate">
        <h2>Celebrating community’s impact</h2>
        <p>
          Check out the impact of our community’s efforts! These contributions
          highlight how volunteers are tirelessly improving web documentation.
          From fixing issues to translating content, every contribution makes a
          difference.
        </p>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>zh-CN: create Glossary/WCAG</td>
              <td>
                <a href="https://github.com/mdn/translated-content/">
                  mdn/translated-content
                </a>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>zh-CN: create Glossary/WCAG</td>
              <td>
                <a href="https://github.com/mdn/translated-content/">
                  mdn/translated-content
                </a>
              </td>
              <td>16 hours ago</td>
            </tr>
          </tbody>
        </table>
      </section>
      {/* 9. Licensing and reuse */}
      <section className="license">
        MDN's resources are freely available under various open-source licenses.
        For detailed information on reusing MDN content, check out our{" "}
        <a href="https://developer.mozilla.org/en-US/docs/MDN/About#using_mdn_web_docs_content">
          Attribution and Copyright Licensing
        </a>{" "}
        page.
      </section>
    </main>
  );
}
