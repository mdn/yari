const fs = require("fs");

const TOUCHTHIS_PATH = "src/touchthis.js";
fs.writeFileSync(TOUCHTHIS_PATH, "export default [];");
