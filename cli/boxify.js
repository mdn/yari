const { EOL } = require("os");
const chalk = require("chalk");

const PADDING = 3;
const X_CHAR = chalk.yellow("=");
const Y_CHAR = chalk.yellow("|");

module.exports = function boxify(lines) {
  const maxLength = lines.reduce((max, s) => Math.max(max, s.length), 0);
  const xBorder = X_CHAR.repeat(maxLength + 2 + PADDING * 2);
  const paddedLines = ["", ...lines, ""];
  return [
    xBorder,
    paddedLines
      .map(
        s =>
          Y_CHAR +
          " ".repeat(PADDING) +
          s +
          " ".repeat(maxLength - s.length) +
          " ".repeat(PADDING) +
          Y_CHAR
      )
      .join(EOL),
    xBorder
  ].join(EOL);
};
