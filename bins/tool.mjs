#!/usr/bin/env node
import { rariBin } from "@mdn/rari";
import { spawn } from "cross-spawn";

spawn(rariBin, ["content"], { stdio: "inherit" });
