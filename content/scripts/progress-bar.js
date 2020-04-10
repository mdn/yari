class ProgressBar {
  constructor({ prefix = "Progress: ", includeMemory = false }) {
    this.total;
    this.current;
    this.prefix = prefix;
    this.includeMemory = includeMemory;
    if (!process.stdout.columns) {
      throw new Error("You can't use this class if it's not a TTY");
    }
    this.barLength =
      process.stdout.columns - prefix.length - "100.0%".length - 5;
    if (includeMemory) {
      this.barLength -= 10;
    }
  }

  init(total) {
    if (!total) {
      throw new Error("Must be initialized with a >0 number.");
    }
    this.total = total;
    this.current = 0;
    this.update(this.current);
  }

  update(current) {
    this.current = current;
    this.draw(this.current / this.total);
  }

  draw(currentProgress) {
    const filledBarLength = Math.round(currentProgress * this.barLength);
    const emptyBarLength = this.barLength - filledBarLength;

    const filledBar = this.getBar(filledBarLength, "█");
    const emptyBar = this.getBar(emptyBarLength, "░");

    const percentageProgress = this.rJust(
      `${(currentProgress * 100).toFixed(1)}%`,
      "100.0%".length
    );

    let out = `${this.prefix}[${filledBar}${emptyBar}] | ${percentageProgress}`;
    if (this.includeMemory) {
      const bytes = process.memoryUsage().heapUsed;
      out += ` | ${this.rJust(this.humanFileSize(bytes))}`;
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(out);
  }

  stop() {
    process.stdout.write("\n");
  }

  humanFileSize(size) {
    if (size < 1024) return size + " B";
    let i = Math.floor(Math.log(size) / Math.log(1024));
    let num = size / Math.pow(1024, i);
    let round = Math.round(num);
    num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round;
    return `${num} ${"KMGTPEZY"[i - 1]}B`;
  }
  rJust(str, length) {
    while (str.length < length) {
      str = ` ${str}`;
    }
    return str;
  }

  getBar(length, char, color = (a) => a) {
    return color(Array(length).fill(char).join(""));
  }
}

module.exports = ProgressBar;
