const StyleDictionary = require("style-dictionary"); // eslint-disable-line node/no-unpublished-require

StyleDictionary.registerTransform({
  name: "value/rewrite",
  type: "value",
  transformer: function (token) {
    if (token.value.startsWith("$")) {
      const baseTokenValue = token.value.replace("$", "");
      return `{${baseTokenValue}.value}`;
    }
    return token.value;
  },
});

StyleDictionary.registerTransform({
  name: "value/tostring",
  type: "value",
  matcher: function (token) {
    return token.attributes.category === "media-queries";
  },
  transformer: function (token) {
    return `"${token.value}"`;
  },
});

module.exports = {
  source: ["./client/src/ui/style-dictionary/**/*.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      transforms: ["value/rewrite", "value/tostring", "name/cti/kebab"],
      buildPath: "./client/src/ui/vars/sass/",
      prefix: "token",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    js: {
      transformGroup: "js",
      transforms: ["name/cti/camel", "value/rewrite"],
      buildPath: "./client/src/ui/vars/js/",
      files: [
        {
          destination: "variables.js",
          format: "javascript/es6",
        },
      ],
    },
  },
};
