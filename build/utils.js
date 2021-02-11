function humanFileSize(size) {
  if (size < 1024) return `${size} B`;
  const i = Math.floor(Math.log(size) / Math.log(1024));
  let num = size / 1024 ** i;
  const round = Math.round(num);
  if (round < 10) {
    num = num.toFixed(2);
  } else if (round < 100) {
    num = num.toFixed(1);
  } else {
    num = round;
  }
  return `${num} ${"KMGTPEZY"[i - 1]}B`;
}

module.exports = { humanFileSize };
