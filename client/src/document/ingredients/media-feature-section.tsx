import { MediaFeatureSectionProps } from "../../../../libs/types/document";
import { ReactNode, useLayoutEffect, useState } from "react";

/**
 * Creates a notecard informing the user about the current value of a given media feature on his device.
 * This section is usually created by MediaFeatureValue.ejs
 * @param featureName name of media feature. For example: "device-width", "resolution"
 * @param featureValueType -tring containing specification value of a given feature. For example: "<resolution> | infinite"
 */
export function MediaFeatureSection({
  query: featureName,
  featureValueType,
}: MediaFeatureSectionProps) {
  // Avoiding hydration mismatch
  const [client, setClient] = useState(false);
  useLayoutEffect(() => setClient(true), []);

  if (!client) {
    return (
      <SectionCard success={false}>
        Current value of <strong>{featureName}</strong> feature is currently
        being loaded.
      </SectionCard>
    );
  }

  const value = getMediaQueryValue(featureName, featureValueType);

  if (value === undefined) {
    // None of the keywords match or the media query is not supported by the browser
    return (
      <SectionCard success={false}>
        Current value of <strong>{featureName}</strong> feature couldn't be
        calculated, because it's not supported by your browser.
      </SectionCard>
    );
  } else {
    return (
      <SectionCard success={true}>
        Current value of <strong>{featureName}</strong> feature on your device
        is <strong>{value}</strong>.
      </SectionCard>
    );
  }
}

function SectionCard({
  success,
  children,
}: {
  success: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`media-feature-note notecard ${
        success ? "success" : "warning"
      }`}
    >
      <p>
        <strong>Media Feature:</strong> {children}
      </p>
    </div>
  );
}

function getMediaQueryValue(featureName: string, specValue: string) {
  const valueTypes = splitSpecValue(specValue);

  for (const valueType of valueTypes) {
    const value = testValueOfType(featureName, valueType);
    if (value !== undefined) {
      return value;
    }
  }

  // None of the keywords match or the media query is not supported by the browser
  return undefined;
}

function splitSpecValue(valueType: string): string[] {
  return valueType.split("|").map((v) => v.trim());
}

/**
 * @returns user's calculated value of a given type, or undefined, if valueType is not supported or all tested values are incorrect
 */
function testValueOfType(
  featureName: string,
  valueType: string
): string | undefined {
  if (!valueType.startsWith("<"))
    return getKeywordValue(featureName, valueType);

  switch (valueType) {
    case "<length>":
      return getNumericalValue(featureName, 0, "px");
    case "<integer>":
      return getNumericalValue(featureName, 0, "");
    case "<mq-boolean>":
      return getBooleanValue(featureName);
    case "<resolution>":
      return getNumericalValue(featureName, 1, "dpi");
    case "<ratio>":
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

  console.error(
    `Media feature value type ${valueType} is currently not supported.`
  );
  return undefined;
}

function testValue(featureName, value) {
  return window.matchMedia("(" + featureName + ": " + value + ")").matches;
}

function getKeywordValue(featureName, keyword): string | undefined {
  if (testValue(featureName, keyword)) {
    return keyword;
  }
  return undefined;
}

function getBooleanValue(featureName): string | undefined {
  if (testValue(featureName, "0")) return "0";
  if (testValue(featureName, "1")) return "1";
  return undefined; // Feature is not supported
}

function getNumericalValue(
  featureName,
  minimumPossibleValue,
  unit
): string | undefined {
  if (!testValue(`min-${featureName}`, `${minimumPossibleValue}${unit}`))
    return undefined; // Feature is not supported

  let lower = 0;
  let higher = 8192;
  let triesLeft = 20;
  let value = Math.floor((lower + higher) / 2);
  // Binary Search
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

function getAspectRatio(featureName, width, height): string {
  // Greatest common divisor
  function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }

  const divisor = gcd(width, height);

  return width / divisor + "/" + height / divisor;
}
