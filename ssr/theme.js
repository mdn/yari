/* eslint-env browser */
/* eslint-disable n/no-unsupported-features/node-builtins */
/**
 * If we modify this script, we must update the CSP hash as follows:
 * 1. Run `yarn build:ssr`
 * 2. Open `libs/constants/index.js` and find the current hash in CSP_SCRIPT_SRC_VALUES.
 * 3. Remove the old "previous" hash and replace it with the old "current" hash.
 * 4. Replace the old "current" hash with the new hash from the failing test (step 1).
 */
document.body.addEventListener(
  "load",
  (e) => {
    if (e.target.classList.contains("interactive")) {
      e.target.setAttribute("data-readystate", "complete");
    }
  },
  { capture: true }
);

if (window && document.documentElement) {
  const c = { light: "#ffffff", dark: "#1b1b1b" };
  try {
    const o = window.localStorage.getItem("theme");
    o &&
      ((document.documentElement.className = o),
      (document.documentElement.style.backgroundColor = c[o]));
    const n = window.localStorage.getItem("nop");
    n && (document.documentElement.dataset["nop"] = n);
  } catch (e) {
    console.warn("Unable to read theme from localStorage", e);
  }
}