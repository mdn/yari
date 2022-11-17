// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

const transform = {
  process() {
    return { code: "export default {};" };
  },
  getCacheKey() {
    // The output is always the same.
    return "cssTransform";
  },
};

export default transform;
