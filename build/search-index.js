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
      items.sort((a, b) => {
        const popularityA = getPopularity(a);
        const popularityB = getPopularity(b);
        const diff = popularityB - popularityA;
        if (diff === 0) {
          return a.url < b.url ? -1 : a.url > b.url ? 1 : 0;
        }
        return diff;
      });
    }
  }

  getItems() {
    return this._itemsByLocale;
  }
};
