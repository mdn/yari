import StyleDictionary from "style-dictionary"; // eslint-disable-line n/no-unpublished-import

StyleDictionary.registerTransform({
  name: "value/rewrite",
  type: "value",
  transformer: function (token) {
    if (token.value && token.value.startsWith("$")) {
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

StyleDictionary.registerTransform({
  name: "value/topx",
  type: "value",
  matcher: function (token) {
    return token.attributes.category === "spacing";
  },
  transformer: function (token) {
    return `${token.value}px`;
  },
});

StyleDictionary.registerTransform({
  name: "value/toint",
  type: "value",
  matcher: function (token) {
    return token.attributes.category === "spacing";
  },
  transformer: function (token) {
    return Number.parseInt(token.value, 10);
  },
});

export default {
  source: ["./client/src/ui/style-dictionary/**/*.json"],
  platforms: {
    scss: {
      transformGroup: "scss",
      transforms: [
        "value/rewrite",
        "value/tostring",
        "value/topx",
        "name/cti/kebab",
      ],
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
      transforms: ["name/cti/camel", "value/rewrite", "value/toint"],
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
