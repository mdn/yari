#!/usr/bin/env node
import { rariBin } from "@mdn/rari";
import { spawn } from "cross-spawn";
import { config } from "dotenv";
import path from "node:path";
import { cwd } from "node:process";

import { BUILD_OUT_ROOT } from "../libs/env/index.js";

config({
  path: path.join(cwd(), process.env.ENV_FILE || ".env"),
});

process.env.BUILD_OUT_ROOT = process.env.BUILD_OUT_ROOT || BUILD_OUT_ROOT;

spawn(rariBin, ["build"], { stdio: "inherit" });
