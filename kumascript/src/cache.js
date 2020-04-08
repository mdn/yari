/**
 * This module defines a cache() function for caching the strings
 * returned by other functions.
 *
 * @prettier
 */

// The cache() function that is exported by this module needs
// get and set functions that represent the actual caching
// operations. We'll use an in-memory LRU cache.
const backend = require("./cache-lru.js");

/**
 * Look up the specified key in the cache, and return its value if
 * we have one. Otherwise, call the computeValue() function to compute
 * the value, store it in the cache, and return the value. If skipCache
 * is true, skip the initial cache query and always re-compute the value.
 *
 * Note that computeValue() is expected to be an async function, and
 * we await its result. The result is that this function is async even
 * though the current LRU-based cache is not itself async.
 */
async function cache(key, computeValue, skipCache = false) {
  if (!skipCache) {
    let cached = backend.get(key);
    if (cached !== null) {
      return cached;
    }
  }

  let value = await computeValue();
  if (typeof value === "string") {
    backend.set(key, value);
  } else if (value !== null) {
    // The legacy computeValue() functions we're using in environment.js
    // don't have a way to report async errors and typically just report
    // a value of null if anything goes wrong. If the computeValue() function
    // returns anything other than a string or null, we throw an error.
    throw new TypeError("cached functions should return string values");
  }

  return value;
}

module.exports = cache;
