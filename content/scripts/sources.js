const fs = require("fs");

class Sources {
  constructor() {
    this.list = [];
    // this.buildURIs = new Map();
  }

  add(filepath, config) {
    if (!fs.existsSync(filepath)) {
      throw new Error(`${filepath} does not exist. Not a valid source.`);
    }
    config = config || {};
    const default_ = {
      isStumptown: false,
      watch: false,
      htmlAlreadyRendered: false,
      excludeInTitlesJson: false,
      excludeInSitemaps: false,
      noindexNofollowHeader: false
    };

    this.list.push(Object.assign(default_, config, { filepath }));
  }

  entries() {
    return this.list;
  }
}

module.exports = { Sources };
