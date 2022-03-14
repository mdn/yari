import { CRUD_MODE } from "../../../constants";
import Mandala from "../../../ui/molecules/mandala";
import "./index.scss";

function OfferHero() {
  const animate = !CRUD_MODE;
  return (
    <div className="dark offer-hero">
      <header className="container offer-hero-header">
        <div className="offer-hero-wrapper">
          <h1>
            More MDN. <u>Your</u> MDN.
          </h1>
          <h2>
            Support MDN <u>and</u> make it your own. For just $5 a month.
          </h2>
          <div className="button-wrapper">
            <a href="#subscribe" className="button-primary">
              Get started
            </a>
            <a href="#features" className="button-secondary">
              What's included
            </a>
          </div>
        </div>
      </header>
      <div className="mandala-wrapper">
        <Mandala animate={animate} animateColors={animate} />
      </div>
    </div>
  );
}

export default OfferHero;
