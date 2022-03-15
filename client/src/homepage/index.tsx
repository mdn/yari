import "./index.scss";
import { HomepageHero } from "./homepage-hero";
import RecentContributions from "./recent-contributions";
import { ContributorSpotlight } from "./contributor-spotlight";
import { useLocale } from "../hooks";

export function Homepage(props) {
  const locale = useLocale();
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <div className="featured-articles">
          <h2 className="mdn-ui-emphasis-l">Featured Articles</h2>
          <div className="tile-container">
            <div className="article-tile">
              <a href={`/${locale}/docs/Web/HTML`} className="tile-tag">
                HTML
              </a>
              <a
                href={`/${locale}/docs/Web/HTML/Element/dialog`}
                className="tile-title expand-this-link"
              >
                &lt;dialog&gt;: The Dialog element
              </a>
              <p>
                The &lt;dialog&gt; HTML element represents a dialog box or other
                interactive component, such as a dismissible alert, inspector,
                or subwindow.
              </p>
            </div>

            <div className="article-tile">
              <a href={`/${locale}/docs/Web/CSS`} className="tile-tag">
                CSS
              </a>
              <a
                href={`/${locale}/docs/Web/CSS/color-scheme`}
                className="tile-title expand-this-link"
              >
                color-scheme
              </a>
              <p>
                The color-scheme CSS property allows an element to indicate
                which color schemes it can comfortably be rendered in.
                <br />
                Common choices for operating system color schemes are "light"
                and "dark", or "day mode" and "night mode". When a user selects
                one of these color schemes, the operating system makes
                adjustments to the user interface. This includes form controls,
                scrollbars, and the used values of CSS system colors.
              </p>
            </div>

            <div className="article-tile">
              <a href={`/${locale}/docs/Web/API`} className="tile-tag">
                Web APIs
              </a>
              <a
                href={`/${locale}/docs/Web/API/Canvas_API/Tutorial`}
                className="tile-title expand-this-link"
              >
                Canvas tutorial
              </a>
              <p>
                This tutorial describes how to use the &lt;canvas&gt; element to
                draw 2D graphics, starting with the basics. The examples
                provided should give you some clear ideas about what you can do
                with canvas, and will provide code snippets that may get you
                started in building your own content.
              </p>
            </div>
          </div>
        </div>
        <RecentContributions {...props} />
        <ContributorSpotlight {...props} />
      </div>
    </main>
  );
}
