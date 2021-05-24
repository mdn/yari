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
      <p>Hi I'm Daryl!</p>
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
    </div>
  );
}
