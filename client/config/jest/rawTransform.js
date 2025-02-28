// This is a custom Jest transformer turning raw imports into empty strings.
// http://facebook.github.io/jest/docs/en/webpack.html

const transform = {
  process() {
    return { code: "module.exports = '';" };
  },
  getCacheKey() {
    // The output is always the same.
    return "rawTransform";
  },
};

export default transform;
