const fs = require("fs");
const path = require("path");

const { CONTENT_ROOT } = require("content");

const popularities = JSON.parse(
  fs.readFileSync(path.join(CONTENT_ROOT, "popularities.json"), "utf-8")
);

const getPopularity = (item) => popularities[item.url];

module.exports = class SearchIndex {
  _itemsByLocale = {};

  add({ metadata: { locale, title }, url }) {
    if (!this._itemsByLocale[locale]) {
      this._itemsByLocale[locale] = [];
    }
    this._itemsByLocale[locale].push({ title, url });
  }

  sort() {
    for (const items of Object.values(this._itemsByLocale)) {
      items.sort((a, b) => getPopularity(b) - getPopularity(a));
    }
  }

  getItems() {
    return this._itemsByLocale;
  }
};
