import "./index.scss";
import { HomepageHero } from "./homepage-hero";
import RecentContributions from "./recent-contributions";
import { ContributorSpotlight } from "./contributor-spotlight";

export function Homepage(props) {
  return (
    <main id="content" role="main">
      <div className="homepage mdn-ui-body-m">
        <HomepageHero />
        <div className="featured-articles">
          <h2 className="mdn-ui-emphasis-l">Featured Articles</h2>
          <div className="tile-container">
            <div className="article-tile">
              <a href="/en-US/docs/Web/CSS/" className="tile-tag">
                CSS
              </a>
              <a
                href="/en-US/docs/Web/CSS/gradient/conic-gradient()"
                className="tile-title"
              >
                conic-gradient()
              </a>
              <p>
                The conic-gradient() CSS function creates an image consisting of
                a gradient with color transitions rotated around a center point
                (rather than radiating from the center).
              </p>
            </div>

            <div className="article-tile">
              <a href="/en-US/docs/Web/CSS/" className="tile-tag">
                CSS
              </a>
              <a
                href="/en-US/docs/Web/CSS/gradient/conic-gradient()"
                className="tile-title"
              >
                conic-gradient()
              </a>
              <p>
                The conic-gradient() CSS function creates an image consisting of
                a gradient with color transitions rotated around a center point
                (rather than radiating from the center).
              </p>
            </div>

            <div className="article-tile">
              <a href="/en-US/docs/Web/CSS/" className="tile-tag">
                CSS
              </a>
              <a
                href="/en-US/docs/Web/CSS/gradient/conic-gradient()"
                className="tile-title"
              >
                conic-gradient()
              </a>
              <p>
                The conic-gradient() CSS function creates an image consisting of
                a gradient with color transitions rotated around a center point
                (rather than radiating from the center).
              </p>
            </div>
          </div>
        </div>
        <RecentContributions {...props} />
        <ContributorSpotlight />
      </div>
    </main>
  );
}
