import React from "react";
import "./index.scss";

const LandingPageSurvey = React.lazy(() => import("./landing-page-survey"));

type Variant = 0 | 1 | 2 | 3;

const LOCALSTORAGE_KEY = "plus_lc_variant";

function loadPreviousVariant(possibleVariants: Variant[]): Variant | undefined {
  try {
    const previous = localStorage.getItem(LOCALSTORAGE_KEY);
    if (previous) {
      const value = parseInt(previous) as Variant;
      if (possibleVariants.includes(value)) {
        return value;
      }
    }
  } catch (error) {
    // Can happen if localStorage simply isn't working in this browser!
    // Or, if the saved value isn't a valid number.
  }
  return undefined;
}

function setPreviousVariant(value: Variant) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, `${value}`);
  } catch (error) {
    // Can happen if localStorage simply isn't working in this browser!
  }
}

export default function App() {
  const variants: Variant[] = [0, 1, 2, 3];
  const previousVariant = loadPreviousVariant(variants);
  const variant: Variant =
    previousVariant || variants[Math.floor(Math.random() * variants.length)];

  if (!previousVariant) {
    setPreviousVariant(variant);
  }

  return (
    <div className="plus">
      <main>
        <a href="#waitlist">
          <button className="mobile-cta">Join the waitlist</button>
        </a>
        <header>
          <div className="header-wrapper">
            <div className="header-content">
              <h2>MDN Plus</h2>
              <h1>General MDN Plus blurb ut consectetur faucibus massa</h1>
              <p>
                Eget mattis sollicitudin ullamcorper neque massa, vestibulum,
                vitae non sed. Aenean ut faucibus.
              </p>

              <a href="#waitlist">
                <button>Join the waitlist</button>
              </a>
            </div>
            <div className="header-illustration">
              <div className="mandala" />
            </div>
          </div>
        </header>
        <section>
          <div className="feature-wrapper">
            <div className="section-feature-2-col">
              <div>
                <h2>Why are we doing this?</h2>
                <p>
                  Help keep MDN free. Auctor cursus sagittis, pharetra at ut
                  habitant tellus ipsum leo. Lacus sagittis, vitae at netus
                  nunc, a habitasse et. Leo at est, duis aliquam varius faucibus
                  montes, odio ullamcorper.
                </p>
              </div>

              <div>
                <h2>What does this mean for MDN?</h2>
                <p>
                  Id justo et, scelerisque diam. Est vitae iaculis fusce
                  facilisi. Nisi hac aenean habitant dignissim. Aenean aliquam
                  risus curabitur libero sed donec tellus, elementum ornare.
                  Quam habitasse porta nisi nec ut egestas. Nam aliquam sit
                  tristique bibendum tincidunt.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="purple-bg main-feature">
          <div className="feature-wrapper main-feature-wrapper">
            <figure className="deepdive-mobile" />
            <h2>What's included?</h2>
            <div className="section-feature-2-col">
              <div className="section-main-content">
                <h1>Boost your learning with MDN Deep Dives</h1>
                <ul>
                  <li>
                    Modern CSS in the Real World: Your browser support toolkit
                  </li>
                  <li>
                    GDPR, DSAR, CCPA, and COPA. So Many Acronyms! Learn
                    Mozilla's Framework To Handle Privacy Laws
                  </li>
                  <li>Stop using jQuery and start using JavaScript!</li>
                  <li>A robust CSS pattern library</li>
                  <li>Modern Responsive Web Design</li>
                  <li>Security Considerations in Web Development</li>
                </ul>
              </div>
              <div className="section-main-illustration">
                <figure className="deepdive" />
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="feature-wrapper">
            <div className="section-feature-1-2-col">
              <div className="deep-dive-card">
                <h4>Featured Deep Dive</h4>
                <h2>Handling Modern CSS in the Real World</h2>
                By Rachel Andrew, Title Goes Here After The Name
                <hr />
                <ul>
                  <li>This three part series includes:</li>
                  <li>Planning for browser support</li>
                  <li>Your browser support toolkit</li>
                  <li>Practical browser support</li>
                </ul>
              </div>
              <div>
                <h3>
                  Read an excerpt from an upcoming deep dive on [topic] written
                  by Rachel Andrew, a leading expert on [fields]
                </h3>
                <p>
                  A purus eget tortor lorem vivamus laoreet amet in. Adipiscing
                  egestas nibh arcu, lectus. Tempor venenatis at bibendum
                  vestibulum libero, nunc lorem augue sollicitudin. Enim mi in
                  auctor orci ipsum, sagittis vel augue sit. Nisl nec ipsum
                  tincidunt id aliquam amet, purus euismod. Nunc massa,
                  facilisis amet lorem faucibus. Risus porttitor egestas mattis
                  massa duis mi mus. Id aliquam vel auctor nibh massa tempus
                  pulvinar maecenas sodales.
                </p>
                <p>
                  Turpis aliquet metus potenti dolor mauris faucibus aliquam.
                  Gravida sit odio ipsum magna ut nunc turpis elementum enim.
                  Molestie rutrum odio ornare fames. Nulla id sit eu nascetur
                  etiam vel. Pharetra risus proin eu vitae adipiscing nisl.
                </p>

                <div className="code-snippet">
                  <code>$.extend(&#123;&#125;, objA, objB);</code>
                </div>

                <p>Nisl nec ipsum tincidunt id aliquam amet:</p>
                <div className="code-snippet">
                  <code>$.extend(&#123;&#125;, objA, objB);</code>
                </div>
                <p>
                  Sed et eros libero, in. Pretium ultricies platea nisl
                  senectus. Risus enim lacus sapien elementum in sed. Elit
                  tempor morbi magna quis tempor quisque fames. Ac magnis et
                  imperdiet dolor vulputate. Tristique at id suspendisse sit
                  tristique sagittis. Nam vel tristique arcu volutpat nisi,
                  faucibus. Ut id viverra fermentum aliquet cursus molestie eget
                  est turpis. Diam egestas ac quam viverra vestibulum nunc,
                  aenean. Aliquet vitae metus mattis odio. Mi cursus viverra
                  egestas a, tortor, enim. Diam amet mattis in felis vitae
                  dictum a morbi dolor. Tincidunt sit vestibulum tristique
                  sapien sit.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="white-bg">
          <div className="feature-wrapper">
            <div className="section-feature-3-col">
              <div className="tile">
                <figure className="bookmark" />
                <h1>Build a permanent library of everything you’ve saved</h1>
                Emphasis on integration in web docs as well as new platform
                [save as PDF]
              </div>
              <div className="tile">
                <figure className="offline" />
                <h1>Take MDN with you wherever you are</h1>
                Emphasis on integration in web docs as well as new platform
                [bookmarks]
              </div>
              <div className="tile">
                <figure className="annotate" />
                <h1>
                  Capture ideas with unlimited highlighting and notetaking
                </h1>
                Emphasis on integration in web docs as well as new platform
                [annotations]
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="feature-wrapper">
            <h2>How much will it cost?</h2>
            <p>
              We’re asking $8 a month or $$ a year. Your subscription includes
              full access to [deep dives + premium features]
            </p>
          </div>
        </section>
        <section className="purple-bg" id="waitlist" style={{ zIndex: 1001 }}>
          <div className="feature-wrapper waitlist">
            <h2>Interested? Be the first to be notified when we launch.</h2>
            <input type="email" placeholder="E-mail address"></input>
            <button>Join the waitlist</button>
            <br />
            <small>
              By proceeding, you agree to the <u>Terms of Service</u> and&nbsp;
              <u>Privacy Notice</u>.
            </small>

            {/*  
            {variant === 1 || variant === 3 ? (
              <p>Hi, this is variant 1 or 3!</p>
            ) : (
              <p>This must be variant 0 or 2</p>
            )}

            {variant !== 3 && <p>The price is $10/month</p>}

            {process.env.NODE_ENV === "development" && (
              <div style={{ margin: 20, float: "right" }}>
                <button
                  onClick={() => {
                    localStorage.removeItem(LOCALSTORAGE_KEY);
                    window.location.reload();
                  }}
                >
                  <small>Dev Reset Landing page</small>
                </button>
              </div>
            )}

            <React.Suspense fallback={<p>Loading waitlist form...</p>}>
              <LandingPageSurvey variant={variant} />
            </React.Suspense>
            */}
          </div>
        </section>
      </main>
    </div>
  );
}
