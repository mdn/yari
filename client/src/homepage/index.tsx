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
                The conic-gradient() CSS function creates an image consisting of
                a gradient with color transitions rotated around a center point
                (rather than radiating from the center).
              </p>
            </div>

            <div className="article-tile">
              <a href="/en-US/docs/Web/API/Web_Audio_API" className="tile-tag">
                Web APIs
              </a>
              <a
                href="/en-US/docs/Web/CSS/gradient/conic-gradient()"
                className="tile-title expand-this-link"
              >
                Web Audio API
              </a>
              <p>
                The Web Audio API provides a powerful and versatile system for
                controlling audio on the Web, allowing developers to choose
                audio sources, add effects to audio, create audio
                visualizations, apply spatial effects (such as panning) and much
                more.
              </p>
            </div>

            <div className="article-tile">
              <a href="/en-US/docs/Web/CSS/" className="tile-tag">
                CSS
              </a>
              <a
                href="/en-US/docs/Web/CSS/gradient/conic-gradient()"
                className="tile-title expand-this-link"
              >
                &#60;track&#62;
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
        <ContributorSpotlight {...props} />
      </div>
    </main>
  );
}
