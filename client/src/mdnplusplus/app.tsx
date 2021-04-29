import "./index.scss";

type Variant = 0 | 1 | 2 | 3;

interface IFrameData {
  src: string;
  title: string;
  width: number;
  height: number;
}

function getSurveyIframe(variant: number): IFrameData {
  const _default: IFrameData = {
    // From https://app.alchemer.com/distribute/share/id/6295937
    src: "https://survey.alchemer.com/s3/6295937/MDN-Fake-Door-Survey",
    title: "MDN++ survey",
    width: 700,
    height: 500,
  };
  // Remember variant 0 is the default.
  if (variant === 1) {
    return Object.assign({}, _default, {
      src: "https://survey.alchemer.com/s3/6295937/MDN-Fake-Door-SurveyV1",
    });
  }
  if (variant === 2) {
    return Object.assign({}, _default, {
      src: "https://survey.alchemer.com/s3/6295937/MDN-Fake-Door-SurveyV2",
    });
  }
  return _default;
}

const LOCALSTORAGE_KEY = "mdnplusplus_lc_variant";

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

export default function App({ ...appProps }) {
  const variants: Variant[] = [0, 1, 2, 3];
  const previousVariant = loadPreviousVariant(variants);
  const variant: Variant =
    previousVariant || variants[Math.floor(Math.random() * variants.length)];

  if (!previousVariant) {
    setPreviousVariant(variant);
  }

  const iframe = getSurveyIframe(variant);
  return (
    <div className="mdnplusplus">
      <p>Hi I'm Daryl!</p>
      {variant === 1 || variant === 3 ? (
        <p>Hi, this is variant 1 or 3!</p>
      ) : (
        <p>This must be variant 0 or 2</p>
      )}

      {variant !== 3 && <p>The price is $10/month</p>}

      <iframe
        src={iframe.src}
        title={iframe.title}
        frameBorder="0"
        width={iframe.width}
        height={iframe.height}
        style={{ overflow: "hidden" }}
      ></iframe>
    </div>
  );
}
