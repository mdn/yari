import { MediaFeatureSectionProps } from "../../../../libs/types/document";

function getMediaQueryValue(
  featureName: string,
  valueType?: string,
  enumValues?: string[]
) {
  switch (valueType) {
    case "enum":
      return getEnumValue(featureName, enumValues);
    case "integer":
      return getNumericalValue(featureName, 0, "");
    case "length":
      return getNumericalValue(featureName, 0, "px");
    case "resolution":
      return getNumericalValue(featureName, 1, "dpi");
    case "ratio":
      if (featureName === "aspect-ratio") {
        return getAspectRatio(
          featureName,
          window.innerWidth,
          window.innerHeight
        );
      } else if (featureName === "device-aspect-ratio") {
        return getAspectRatio(
          featureName,
          window.screen.width,
          window.screen.height
        );
      }
  }

  throw new Error(
    '"' +
      featureName +
      '" media feature value couldn\'t be calculated, because value type "' +
      valueType +
      '" is not supported.'
  );

  function testValue(featureName, value) {
    console.log("testing value");
    return true;
    //return window.matchMedia("(" + featureName + ": " + value + ")").matches;
  }

  function getEnumValue(featureName, enumValues) {
    for (let value of enumValues) {
      if (value !== undefined && testValue(featureName, value)) return value;
    }
    return undefined; //Feature is not supported or array of enum values is incorrect.
  }

  function getNumericalValue(featureName, minimumPossibleValue, unit) {
    if (!testValue(`min-${featureName}`, `${minimumPossibleValue}${unit}`))
      return undefined; //Feature is not supported

    let lower = 0;
    let higher = 8192;
    let triesLeft = 20;
    let value = Math.floor((lower + higher) / 2);

    while (triesLeft > 0 && higher - lower > 1) {
      triesLeft--;
      if (testValue(`min-${featureName}`, `${value}${unit}`)) {
        lower = value;
      } else {
        higher = value;
      }
      value = Math.floor((higher + lower) / 2);
    }
    return `${value}${unit}`;
  }

  function getAspectRatio(featureName, width, height) {
    function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
    }

    const divisor = gcd(width, height);

    return width / divisor + "/" + height / divisor;
  }
}

export function MediaFeatureSection({
  query: featureName,
  featureValueType,
  featureEnumArgs,
}: MediaFeatureSectionProps) {
  let value = getMediaQueryValue(
    featureName,
    featureValueType,
    featureEnumArgs.split(" ")
  );

  if (value === undefined) {
    //Feature is not supported or enumeration array is missing correct value
    return (
      <>
        <div className="media-feature-note notecard warning">
          <p>
            <strong>Media Feature:</strong> Current value of{" "}
            <strong>{featureName}</strong> feature couldn't be calculated,
            because it's not supported by your browser.
          </p>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="media-feature-note notecard success">
          <p>
            <strong>Media Feature:</strong> Current value of{" "}
            <strong>{featureName}</strong> feature on your device is{" "}
            <strong>{value}</strong>.
          </p>
        </div>
      </>
    );
  }
}
