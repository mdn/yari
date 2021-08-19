import { useParams } from "react-router-dom";

import "./index.scss";

export function ProductTeaser() {
  const { locale } = useParams();
  return (
    <div className="product-teaser">
      <div className="teaser-content-container girdle">
        <p className="teaser-copy">
          Liked what you've read? <br /> Find out more about{" "}
          <span className="gradient-clip-text">MDN Plus</span>, our upcoming
          premium subscription!
          <a href={`/${locale}/plus`} className="learn-more">
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
