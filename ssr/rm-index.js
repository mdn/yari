// temporary script to delete root index.html for testing
// separate from https://github.com/mdn/yari/pull/11672
import fs from "node:fs";
import path from "node:path";

import paths from "../client/config/paths.js";

const indexHtmlFilePath = path.join(paths.appBuild, "index.html");
fs.rmSync(indexHtmlFilePath);
