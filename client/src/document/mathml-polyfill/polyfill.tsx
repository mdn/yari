// This file exists so that when React.Suspense loads, it notices that there's
// 'mathml.css' file that needs to be loaded into the DOM.
// See the <MathMLPolyfillMaybe/> component which conditionally loads this
// component.

import "./mathml.css";

function MathMLPolyfill() {
  return null;
}

export default MathMLPolyfill;
