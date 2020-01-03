// Note! This is copied verbatim from stumptown-content

const bcd = require("mdn-browser-compat-data");

function packageBCD(query) {
  let data = query.split(".").reduce(function(prev, curr) {
    return prev ? prev[curr] : undefined;
  }, bcd);
  return data;
}

module.exports = {
  packageBCD
};
