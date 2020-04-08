function timeout(promise, seconds, msg) {
  // Create a "timer" promise that rejects after "seconds".
  let timerID;
  let timer = new Promise((resolve, reject) => {
    timerID = setTimeout(() => {
      reject(`${msg}: timed-out after ${seconds}s`);
    }, seconds * 1000);
  });
  // Return a promise that either resolves or rejects
  // depending upon which of its constituent promises,
  // the provided promise or the timer, resolves or
  // rejects first.
  return Promise.race([promise, timer]).finally(() => {
    clearTimeout(timerID);
  });
}

module.exports = { timeout };
