import "./index.scss";

export function Hero() {
  return (
    <header className="plus-hero">
      <div className="header-wrapper">
        <div className="header-content">
          <div className="heading-group">
            <h1>
              More MDN.{" "}
              <span className="gradient-clip-text break-tablet">Your MDN.</span>
            </h1>
            <h2 className="gradient-clip-text">MDN Plus</h2>
          </div>
          <p>
            <b>Coming soon</b> &mdash; a new premium service with monthly
            technical deep dives written by industry experts and powerful new
            features to personalize your MDN experience.
          </p>
        </div>
      </div>
    </header>
  );
}
