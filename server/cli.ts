import { concurrently } from "concurrently";
import { rariBin } from "@mdn/rari";
import { filename } from "./filename.js";

const { result } = concurrently(
  [
    {
      command: `node ${filename}`,
      name: "server",
      env: {
        NODE_OPTIONS: "--no-warnings=ExperimentalWarning --loader ts-node/esm",
      },
    },
    {
      command: `${rariBin} serve -vv`,
      name: "rari",
    },
  ],
  {
    prefix: "🙈",
    killOthers: ["failure", "success"],
    restartTries: 0,
  }
);

try {
  await result;
} catch {
  console.error("NOPE");
}
