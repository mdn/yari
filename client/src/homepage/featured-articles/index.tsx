import { useLocale } from "../../hooks";

import "./index.scss";

export function FeaturedArticles() {
  const locale = useLocale();

  return (
    <div className="featured-articles">
      <h2>Featured Articles</h2>
      <div className="tile-container">
        <div className="article-tile">
          <a href={`/${locale}/docs/Web/HTML`} className="tile-tag">
            HTML
          </a>
          <h3 className="tile-title">
            <a href={`/${locale}/docs/Web/HTML/Element/dialog`}>
              &lt;dialog&gt;: The Dialog element
            </a>
          </h3>
          <p>
            The &lt;dialog&gt; HTML element represents a dialog box or other
            interactive component, such as a dismissible alert, inspector, or
            subwindow.
          </p>
        </div>

        <div className="article-tile">
          <a href={`/${locale}/docs/Web/CSS`} className="tile-tag">
            CSS
          </a>
          <h3 className="tile-title">
            <a href={`/${locale}/docs/Web/CSS/color-scheme`}>color-scheme</a>
          </h3>
          <p>
            The color-scheme CSS property allows an element to indicate which
            color schemes it can comfortably be rendered in.
          </p>
        </div>

        <div className="article-tile">
          <a href={`/${locale}/docs/Web/API`} className="tile-tag">
            Web APIs
          </a>
          <h3 className="tile-title">
            <a href={`/${locale}/docs/Web/API/Canvas_API/Tutorial`}>
              Canvas tutorial
            </a>
          </h3>
          <p>
            This tutorial describes how to use the &lt;canvas&gt; element to
            draw 2D graphics, starting with the basics.
          </p>
        </div>
      </div>
    </div>
  );
}
