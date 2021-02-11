const getMDNRelatedContent = require("./mdn");

function getRelatedContent(sidebar, doc) {
  if (sidebar === "mdn") {
    return getMDNRelatedContent(doc);
  } else {
    throw new Error(`sidebar key '${sidebar}' is currently not recognized`);
  }
}

module.exports = {
  getRelatedContent,
};
