import path from "node:path";
import resolve from "resolve";
import paths from "./paths.js";

/**
 * Get webpack aliases based on the baseUrl of a compilerOptions object.
 *
 * @param {*} options
 */
function getWebpackAliases(options = {}) {
  const baseUrl = options.baseUrl;

  if (!baseUrl) {
    return {};
  }

  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  if (path.relative(paths.appPath, baseUrlResolved) === "") {
    return {
      src: paths.appSrc,
    };
  }
}

async function getModules() {
  const { default: ts } = await import(
    "file://" +
      resolve.sync("typescript", {
        basedir: paths.appNodeModules,
      })
  );
  const config = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile).config;
  const options = config.compilerOptions || {};

  return {
    webpackAliases: getWebpackAliases(options),
  };
}

export default getModules();
