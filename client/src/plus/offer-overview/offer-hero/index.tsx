import "./index.scss";
import Mandala from "../mandala";

function OfferHero() {
  return (
    <header className="offer-hero">
      <div className="offer-hero-wrapper">
        <h1>
          <span>More MDN.</span>
          <span>Your MDN.</span>
        </h1>
        <h2>
          <span>Support MDN and make it your own.</span>
          <span>For just $5 a month.</span>
        </h2>
        <div className="button-wrapper">
          <a href="/#subscribe" className="button-primary">
            Get started
          </a>
          <a href="/#features" className="button-secondary">
            What's included
          </a>
        </div>
      </div>
      <div className="mandala-wrapper">
        <Mandala />
      </div>
    </header>
  );
}

export default OfferHero;
