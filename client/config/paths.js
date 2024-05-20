import { fileURLToPath } from "node:url";

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = new URL("..", import.meta.url);
const resolveApp = (relativePath) =>
  fileURLToPath(new URL(relativePath, appDirectory));

const buildPath = process.env.BUILD_PATH || "build";

const moduleFileExtensions = ["mjs", "js", "ts", "tsx", "json", "jsx"];

// config after eject: we're in ./config/
const config = {
  dotenv: resolveApp("../.env"),
  appPath: resolveApp("."),
  appBuild: resolveApp(buildPath),
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appPackageJson: resolveApp("../package.json"),
  appSrc: resolveApp("src"),
  appTsConfig: resolveApp("tsconfig.json"),
  yarnLockFile: resolveApp("../yarn.lock"),
  libsPath: resolveApp("../libs"),
  moduleFileExtensions,
};

export default config;
