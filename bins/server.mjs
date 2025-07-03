#!/usr/bin/env node
import { concurrently } from "concurrently";
import { rariBin } from "@mdn/rari";
import { filename } from "../server/filename.js";
import dotenv from "dotenv";
import path from "node:path";
import { cwd } from "node:process";

dotenv.config({
  path: path.join(cwd(), process.env.ENV_FILE || ".env"),
  quiet: true,
});

const { commands, result } = concurrently(
  [
    {
      command: `node ${filename}`,
      name: "server",
      env: {
        RARI: true,
      },
      prefixColor: "red",
    },
    {
      command: `"${rariBin}" serve -vv`,
      name: "rari",
      prefixColor: "blue",
      env: {
        ...process.env,
      },
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
