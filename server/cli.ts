import { concurrently } from "concurrently";
import { rariBin } from "@mdn/rari";
import { filename } from "./filename.js";

const { commands, result } = concurrently(
  [
    {
      command: `node ${filename}`,
      name: "server",
      env: {
        NODE_OPTIONS: "--no-warnings=ExperimentalWarning --loader ts-node/esm",
        RARI: true,
      },
      prefixColor: "red",
    },
    {
      command: `${rariBin} serve -vv`,
      name: "rari",
      prefixColor: "blue",
    },
  ],
  {
    killOthers: ["failure", "success"],
    restartTries: 0,
    handleInput: true,
    inputStream: process.stdin,
  }
);

const stop = new Promise((resolve, reject) => {
  process.on("SIGINT", () => {
    commands.forEach((cmd) => cmd.kill()); // Terminate all concurrently-run processes
    reject();
  });
  result.finally(() => resolve(null));
});
try {
  await stop;
  console.log("All tasks completed successfully.");
} catch {
  console.log("Killed ☠️");
}
