// Note! This is copied verbatim from stumptown-content

const bcd = require("@mdn/browser-compat-data");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'packageBCD... Remove this comment to see the full error message
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
