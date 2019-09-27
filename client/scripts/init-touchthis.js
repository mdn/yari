const fs = require("fs");

const TOUCHTHIS_PATH = "src/touchthis.js";
if (!fs.existsSync(TOUCHTHIS_PATH)) {
  fs.writeFileSync(TOUCHTHIS_PATH, "export default [];");
}
