const chalk = require("chalk");

function printBasicDiff(str1, str2) {
  const oldLines = str1.split("\n");
  const newLines = str2.split("\n");
  const newLinesSet = new Set(newLines);
  let firstDiff = true;
  oldLines.forEach((line, i) => {
    if (!newLinesSet.has(line)) {
      if (!firstDiff) {
        console.log("");
      }
      firstDiff = false;
      console.log(lineNumber(i - 1), chalk.grey(`  ${oldLines[i - 1]}`));
      console.log(lineNumber(i), chalk.red(`- ${line}`));
      console.log(lineNumber(i), chalk.green(`+ ${newLines[i]}`));
      console.log(lineNumber(i + 1), chalk.grey(`  ${oldLines[i + 1]}`));
      console.log(lineNumber(i + 2), chalk.grey(`  ${oldLines[i + 2]}`));
    }
  });
}

function lineNumber(i) {
  const number = `${i + 1}`.padEnd(String(i + 1).length);
  return chalk.grey(`${number}|`);
}
module.exports = { printBasicDiff };
