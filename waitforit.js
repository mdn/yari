const fs = require("fs");
const readline = require("readline");
var net = require("net");
var spawn = require("child_process").spawn;

let upAndRunning = false;
const remainingHosts = new Map(process.argv.slice(2).map((h) => [h, false]));

const startTime = new Date();
let pings = 0;
var interval = setInterval(() => {
  try {
    if (pings > 100) {
      throw new Error(`Giving up after ${pings} attempts.`);
    }
    pings++;
    const text = ["Waiting for:"];
    for (const [host, state] of remainingHosts) {
      text.push(`${host.padEnd(12)}: ${state ? "✅" : "⏳"}`);
    }
    text.push(
      `Been waiting ${((new Date() - startTime) / 1000).toFixed(0)} seconds`
    );

    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    process.stdout.write(text.join("\t"));

    let innerPings = 0;
    for (const [host, state] of remainingHosts.entries()) {
      if (state) {
        continue;
      }
      innerPings++;

      const [hostname, port] = host.split(":");
      new net.Socket()
        .connect(parseInt(port), hostname, function () {
          remainingHosts.set(host, true);
        })
        .on("close", function () {})
        .on("error", function (error) {});
    }
    if (!innerPings) {
      process.stdout.write("\n");
      console.log("Looks that all hosts are up and running!\n");
      upAndRunning = true;
      clearInterval(interval);
    }
  } catch (error) {
    console.error(error);
    yarnCommand.kill("SIGHUP");
    process.exitCode = 1;
  }
}, 1000);

const yarnCommand = spawn("yarn", ["dev"]);

yarnCommand.stdout.on("data", function (data) {
  if (upAndRunning) process.stdout.write(data);
  fs.appendFileSync("/tmp/stdout.log", data, "utf-8");
});

yarnCommand.stderr.on("data", function (data) {
  fs.appendFileSync("/tmp/stderr.log", data, "utf-8");
  if (upAndRunning) process.stdout.write(data);
});

yarnCommand.on("exit", function (code) {
  clearInterval(interval);
});
