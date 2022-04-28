import { CRUD_MODE } from "../../../constants";
import Mandala from "../../../ui/molecules/mandala";
import "./index.scss";

function OfferHero({
  isLoading,
  currency,
  plusAvailable,
}: {
  isLoading: boolean;
  currency: string;
  plusAvailable: boolean;
}) {
  const animate = !CRUD_MODE;
  let container;

  //No currency, Pricing info still loading.Display spinner
  if (isLoading) {
    container = (
      <>
        <div className="cash-container">
          <div className="cash-spinner">
            $<br />€<br />£<br />$<br />€<br />£<br />$<br />€
          </div>
        </div>
        <span>5.00</span>
      </>
    );
  } else {
    if (currency) {
      container = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(5);
    } else {
      //Fallback to USD.
      container = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(5);
    }
  }

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
                Support MDN <u>and</u> make it your own. For just {container} a
                month.
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
