#!/usr/bin/env node
import { rariBin } from "@mdn/rari";
import { spawn } from "cross-spawn";
import dotenv from "dotenv";
import path from "node:path";
import { cwd } from "node:process";

import { BUILD_OUT_ROOT } from "../libs/env/index.js";

dotenv.config({
  path: path.join(cwd(), process.env.ENV_FILE || ".env"),
  quiet: true,
});

process.env.BUILD_OUT_ROOT = process.env.BUILD_OUT_ROOT || BUILD_OUT_ROOT;

const child = spawn(rariBin, ["build", ...process.argv.slice(2)], {
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exitCode = code;
});
