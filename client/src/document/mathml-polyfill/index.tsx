import React from "react";

import "./mathml-font.scss";

const MathMLPolyfill = React.lazy(() => import("./polyfill"));

// This component gets rendered if the document has MathML in it.
// But that doesn't mean we necessarily need the CSS polyfill.
// Remember that this component is always lazy loaded.
function MathMLPolyfillMaybe() {
  const [polyfillNeeded, setPolyfillNeeded] = React.useState(false);
  React.useEffect(() => {
    setPolyfillNeeded(!isMathMLSupported());
  }, []);

  if (polyfillNeeded) {
    return (
      <React.Suspense fallback={null}>
        <MathMLPolyfill />
      </React.Suspense>
    );
  }
  return null;
}

export default MathMLPolyfillMaybe;

/**
 * Tests whether MathML is supported(at least in terms of mspace),
 * and returns true or false.
 */
function isMathMLSupported() {
  const offscreenContainer = document.createElement("div");
  const mathMLNamespace = "http://www.w3.org/1998/Math/MathML";
  const mathElement = document.createElementNS(mathMLNamespace, "math");
  const mspaceElement = document.createElementNS(mathMLNamespace, "mspace");
  mspaceElement.setAttribute("height", "23px");
  mspaceElement.setAttribute("width", "77px");
  mathElement.append(mspaceElement);
  offscreenContainer.append(mathElement);
  offscreenContainer.classList.add("offscreen");

  const mathMLTestElement = document.body.appendChild(offscreenContainer);
  if (!mspaceElement) {
    return false;
  }
  const box = mspaceElement.getBoundingClientRect();
  document.body.removeChild(mathMLTestElement);
  if (!box) {
    return false;
  }
  return Math.abs(box.height - 23) <= 1 && Math.abs(box.width - 77) <= 1;
}
