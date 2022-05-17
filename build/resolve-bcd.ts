// Note! This is copied verbatim from stumptown-content

const bcd = require("@mdn/browser-compat-data");

function packageBCD(query) {
  const data = query.split(".").reduce((prev, curr) => {
    return prev && Object.prototype.hasOwnProperty.call(prev, curr)
      ? prev[curr]
      : undefined;
  }, bcd);
  return { browsers: bcd.browsers, data };
}

module.exports = {
  packageBCD,
};
