const fs = require("fs");
const path = require("path");

class Sources {
  constructor() {
    this.list = [];
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
      noindexNofollowHeader: false,
    };

    this.list.push(
      Object.assign(default_, config, { filepath: path.resolve(filepath) })
    );
  }

  entries() {
    return this.list;
  }
}

module.exports = { Sources };
