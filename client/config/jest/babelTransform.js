import { createRequire } from "node:module";
import babelJest from "babel-jest";

const require = createRequire(import.meta.url);

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve("babel-preset-react-app"),
      {
        runtime: "automatic",
      },
    ],
  ],
  babelrc: false,
  configFile: false,
});
