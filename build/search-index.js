const { getPopularities } = require("../content");

// getPopularities() is memoized so it's fast to call repeatedly
const getPopularity = (item) => getPopularities().get(item.url) || 0;

module.exports = class SearchIndex {
  constructor() {
    this._itemsByLocale = {};
  }

  add({ metadata: { locale, title }, url }) {
    const localeLC = locale.toLowerCase();
    if (!this._itemsByLocale[localeLC]) {
      this._itemsByLocale[localeLC] = [];
    }
    this._itemsByLocale[localeLC].push({ title, url });
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
