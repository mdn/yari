// Note! This is copied verbatim from stumptown-content

const bcd = require("@mdn/browser-compat-data");

function queryBCD(query) {
  return query.split(".").reduce((prev, curr) => {
    return prev && Object.prototype.hasOwnProperty.call(prev, curr)
      ? prev[curr]
      : undefined;
  }, bcd);
}

const BCD_BROWSERS = bcd.browsers;

// Map of all release data, keyed by (normalized) browser
// name and the versions:
//
//   'chrome_android': {
//      '28': {
//        release_date: '2012-06-01',
//        release_notes: '...',
//        ...
//
const BCD_BROWSER_RELEASES = (function () {
  const map = new Map();
  for (const [name, browser] of Object.entries(BCD_BROWSERS)) {
    const releaseData = new Map();
    for (const [version, data] of Object.entries(browser.releases || [])) {
      if (data) {
        releaseData.set(version, data);
      }
    }
    map.set(name, releaseData);
  }
  return map;
})();

module.exports = {
  BCD_BROWSER_RELEASES,
  BCD_BROWSERS,
  queryBCD,
};
