import { ReactComponent as Header1 } from "./svg/header-1.svg";
import { ReactComponent as Header2 } from "./svg/header-2.svg";
import { ReactComponent as Header3 } from "./svg/header-3.svg";
import { ReactComponent as MobileHeaderSVG } from "./svg/header-mobile.svg";
import { ReactComponent as VideoPreviewSVG } from "./svg/video-preview.svg";
import { ReactComponent as ChatSVG } from "./svg/chat.svg";
import { ReactComponent as CommunityCallsSVG } from "./svg/community-calls.svg";

import "./index.scss";

const STATS = [
  { id: 1, number: "45k+", legend: "Total contributors" },
  { id: 2, number: "80M+", legend: "Monthly views" },
  { id: 3, number: "200+", legend: "Weekly commits" },
  { id: 4, number: "8", legend: "Language communities" },
];
const LOCALE_COUNT = 9;

const CONTRIBUTE_ACTIONS = [
  {
    title: "Fix issues",
    description: "Submit pull requests to fix reported issues.",
    actions: [
      {
        url: "https://github.comhttps://github.com/mdn/content/issues",
        label: "Squash bugs",
      },
    ],
  },
  {
    title: "Improve content",
    description: "Fix inaccuracies and fill in missing information.",
    actions: [
      {
        url: "https://github.comhttps://github.com/mdn/content/#readme",
        label: "Start writing",
      },
    ],
  },
  {
    title: "Localize content",
    description:
      "Participate in translating content into one of our supported languages.",
    actions: [
      {
        url: "https://github.comhttps://developer.mozilla.org/en-US/docs/MDN/Community/Contributing/Translated_content#active_locales",
        label: "Find your locale",
      },
    ],
  },
  {
    title: "Answer questions",
    description:
      "Share your knowledge and expertise and guide fellow learners.",
    actions: [
      {
        url: "https://github.comhttps://discord.gg/3MKbs99V4F",
        label: "Help on Discord",
      },
    ],
  },
  {
    title: "Talk about MDN",
    description: "Share your stories with us on our Mastodon or X.",
    actions: [
      {
        url: "https://github.comhttps://twitter.com/mozdevnet",
        label: "X",
      },
      {
        url: "https://github.comhttps://mozilla.social/@mdn",
        label: "Mastodon",
      },
    ],
  },
];

const ISSUES = [
  {
    title: "Wrong explanation of the example inside Inline formatting context",
    url: "https://github.com/mdn/content/issues/29035",
    labels: ["Content:CSS", "good first issue"],
  },
  {
    title: "Document false negatives for navigator.onLine property",
    url: "https://github.com/mdn/content/issues/30402",
    labels: ["accepting PR", "Content:WebAPI", "effort: medium"],
  },
  {
    title: "Event not called for modification on sessionStorage",
    url: "https://github.com/mdn/content/issues/30598",
    labels: [
      "accepting PR",
      "Content:WebAPI",
      "effort: small",
      "goal: accuracy",
    ],
  },
  {
    title: "SharedArrayBuffer is not usable as a source data parameter.",
    url: "https://github.com/mdn/content/issues/30749",
    labels: ["accepting PR", "area: WebGL", "Content:WebAPI", "goal: accuracy"],
  },
  {
    title:
      "update Notifications API content to better explain persistent events and not persistent events",
    url: "https://github.com/mdn/content/issues/30931",
    labels: [
      "accepting PR",
      "Content:WebAPI",
      "effort: large",
      "goal: clarity",
    ],
  },
  {
    title: "Update usage for {{AvailableInWorkers}}",
    url: "https://github.com/mdn/content/issues/31675",
    labels: ["accepting PR", "area: Workers", "Content:WebAPI", "MDN:Project"],
  },
  {
    title: 'C# WebSocket server example: Incompatible type for "offset"',
    url: "https://github.com/mdn/content/issues/31774",
    labels: [
      "area: WebSockets",
      "Content:WebAPI",
      "good first issue",
      "help wanted",
    ],
  },
  {
    title:
      "Mention that offsetWidth value is integer and getBoundingClientRect().width is a decimal point number",
    url: "https://github.com/mdn/content/issues/31779",
    labels: ["area: DOM/CSSOM", "Content:WebAPI", "good first issue"],
  },
  {
    title: "cancelAnimationFrame using mismatched time values in sample",
    url: "https://github.com/mdn/content/issues/31840",
    labels: [
      "accepting PR",
      "Content:WebAPI",
      "effort: small",
      "goal: accuracy",
    ],
  },
  {
    title: "Fetch Basic Sample Code 404",
    url: "https://github.com/mdn/content/issues/31841",
    labels: [
      "accepting PR",
      "area: Fetch/XMLHttpRequest",
      "Content:WebAPI",
      "effort: small",
      "goal: accuracy",
    ],
  },
];

export function Community() {
  return (
    <main className="community">
      {/* 1. Header */}
      <section className="hero">
        <h1>MDN Community</h1>
        <p>Contribute, Collaborate and Shape the Future of the Web Together</p>
        <div className="actions">
          <a className="btn primary" href="#join">
            Start Contributing on GitHub
          </a>
          <a
            className="btn secondary"
            href="https://developer.mozilla.org/discord"
          >
            Join MDN Discord
          </a>
        </div>
        <div className="illustration mobile-only">
          <MobileHeaderSVG role="none" />
        </div>
        <div className="desktop-only">
          <Header1 className="top-left" role="none" />
          <Header2 className="bottom-left" role="none" />
          <Header3 className="bottom-right" role="none" />
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
        <section className="contributors desktop-only">
          {/* Left column. */}
          Lorem ipsum
        </section>
        <section className="meet-our-contributors">
          {/* Right column, top. */}
          <h2>Meet our Contributors</h2>
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
            <a
              className="btn primary"
              href="https://developer.mozilla.org/en-US/docs/MDN/Community/Contributing/Getting_started"
            >
              Join us
            </a>
            <a
              className="btn secondary"
              href="https://github.com/mdn/content/graphs/contributors"
            >
              View all contributors
            </a>
          </div>
        </section>
        <section className="contributor-quotes">
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
              <footer>
                -Yuji
                <br />
                (MDN contributor)
              </footer>
            </blockquote>
            <blockquote>
              <p>
                MDN Web Docs has the most up-to-date and accurate information
                and the content is presented in an easy-to-understand manner. I
                also like that it's available in many languages (very
                important!)
              </p>
              <footer>
                -Yuji
                <br />
                (MDN contributor)
              </footer>
            </blockquote>
            <blockquote>
              <p>
                MDN Web Docs has the most up-to-date and accurate information
                and the content is presented in an easy-to-understand manner. I
                also like that it's available in many languages (very
                important!)
              </p>
              <footer>
                -Yuji
                <br />
                (MDN contributor)
              </footer>
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
          {CONTRIBUTE_ACTIONS.map(({ title, description, actions }) => (
            <li className="note">
              <div className="note-inner">
                <h3>{title}</h3>
                <p>{description}</p>
                {actions.map(({ url, label }) => (
                  <a className="btn primary" href={url}>
                    {label}
                  </a>
                ))}
              </div>
            </li>
          ))}
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
              <th>Title</th>
            </tr>
          </thead>
          <tbody>
            {ISSUES.map((issue) => (
              <tr>
                <td>
                  <a href={issue.url} rel="noreferrer noopener" target="_blank">
                    {issue.title}
                  </a>
                  <div className="labels">
                    {issue.labels
                      .filter((label) =>
                        ["good first issue", "accepting PR"].includes(label)
                      )
                      .map((label) => (
                        <span className="label">{label}</span>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <a
            className="btn primary"
            href="https://github.com/issues?q=is%3Aopen+is%3Aissue+repo%3Amdn%2Fcontent+label%3A%22good+first+issue%22%2C%22accepting+PR%22+sort%3Acreated-asc+no%3Aassignee"
          >
            View all issues
          </a>
        </p>
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
      <section className="contact">
        <h2>Join the conversation</h2>
        <div className="channels">
          <figure className="chat">
            <ChatSVG role="none" />

            <figcaption>
              <h3>Chat with us on Discord</h3>
              <p>
                Connect with the community. Engage with domain experts. Help
                others learn.
              </p>
              <a
                className="btn primary"
                href="https://developer.mozilla.org/discord"
              >
                Join MDN Discord
              </a>
            </figcaption>
          </figure>
          <figure className="call">
            <CommunityCallsSVG role="none" />

            <figcaption>
              <h3>Join our Community Calls</h3>
              <p>
                Every month, get exclusive updates from the MDN team. Share your
                ideas and contributions.
              </p>
              <a
                className="btn primary"
                href="https://github.com/mdn/community-meetings?tab=readme-ov-file#mdn-community-meetings"
              >
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
              <th>Repositories</th>
            </tr>
          </thead>
          <tbody>
            {ISSUES.map((issue) => (
              <tr>
                <td>
                  <a href={issue.url} rel="noreferrer noopener" target="_blank">
                    {issue.title}
                  </a>
                  <div className="labels">
                    {issue.labels
                      .filter((label) =>
                        ["good first issue", "accepting PR"].includes(label)
                      )
                      .map((label) => (
                        <span className="label">{label}</span>
                      ))}
                  </div>
                </td>
                <td>
                  <a
                    href="https://github.com/mdn/content"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Content Repository
                  </a>
                </td>
              </tr>
            ))}
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
