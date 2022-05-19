import { CRUD_MODE } from "../../../constants";
import Mandala from "../../../ui/molecules/mandala";
import "./index.scss";

function OfferHero({ plusAvailable }: { plusAvailable: boolean }) {
  const animate = !CRUD_MODE;
  return (
    <div className="dark offer-hero">
      <header className="container offer-hero-header">
        <div className="offer-hero-wrapper">
          <h1>
            More MDN. <u>Your</u> MDN.
          </h1>
          {(plusAvailable && (
            <>
              <h2>
                Support MDN <u>and</u> make it your own.
              </h2>
              <div className="button-wrapper">
                <a href="#subscribe" className="button-primary">
                  Get started
                </a>
                <a href="#features" className="button-secondary">
                  What's included
                </a>
              </div>
            </>
          )) || (
            <>
              <h2>
                Coming to <u>your</u> region soon.
              </h2>
              <div className="button-wrapper">
                <a href="#features" className="button-primary">
                  What's included
                </a>
                <a href="/en-US/plus/docs/faq" className="button-secondary">
                  Frequently asked questions
                </a>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="mandala-wrapper">
        <Mandala animate={animate} animateColors={animate} />
      </div>
    </div>
  );
}

export default OfferHero;
