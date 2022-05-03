// Note! This is copied verbatim from stumptown-content
import bcd from "@mdn/browser-compat-data";

function packageBCD(query) {
  const data = query.split(".").reduce((prev, curr) => {
    return prev && Object.prototype.hasOwnProperty.call(prev, curr)
      ? prev[curr]
      : undefined;
  }, bcd);
  return { browsers: bcd.browsers, data };
}

export { packageBCD };
