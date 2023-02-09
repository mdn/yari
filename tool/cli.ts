#!/usr/bin/env

import caporal from "@caporal/core";

import { addCommands } from "./commands/index.js";

const program = caporal.program
  .bin("yarn tool")
  .name("tool")
  .version("0.0.0")
  .disableGlobalOption("--silent")
  .cast(false);

addCommands(program);

program.run();
