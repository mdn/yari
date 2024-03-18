import { execSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function exists(path: string): Promise<boolean> {
  return fs
    .stat(path)
    .then(() => true)
    .catch(() => false);
}

async function main() {
  try {
    const basedir = path.dirname(fileURLToPath(import.meta.url));
    if (!(await exists(`${basedir}/client/build/index.html`)))
      execSync("yarn build:client", {
        cwd: basedir,
        stdio: "inherit",
      });
    if (!(await exists(`${basedir}/ssr/dist/main.js`)))
      execSync("yarn build:ssr", {
        cwd: basedir,
        stdio: "inherit",
      });

    if (!(await exists(`${basedir}/client/build/en-us/_spas`)))
      execSync("yarn tool spas", {
        cwd: basedir,
        stdio: "inherit",
      });

    execSync("yarn nf -j Procfile.start start", {
      cwd: basedir,
      stdio: "inherit",
    });
  } catch (e: any) {
    console.error(`could not start server: ${e?.message}`);
  }
}

main();
