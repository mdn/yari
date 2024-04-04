import { createRequire } from "node:module";
import babelJest from "babel-jest";

const require = createRequire(import.meta.url);

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
    return false;
  }

  try {
    require.resolve("react/jsx-runtime");
    return true;
  } catch (e) {
    return false;
  }
})();

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve("babel-preset-react-app"),
      {
        runtime: hasJsxRuntime ? "automatic" : "classic",
      },
    ],
  ],
  babelrc: false,
  configFile: false,
});
