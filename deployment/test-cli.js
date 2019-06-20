const fs = require("fs");
// import fs from "fs";
// import url from "url";
// import path from "path";

// sourceMapSupport.install();

const deployer = require("./deployer").deployer;

const args = process.argv.slice(2);

const jsonFile = args[0];
const data = fs.readFileSync(jsonFile, "utf8");
const jsonData = JSON.parse(data);
deployer(jsonData);
