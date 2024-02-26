import { execSync, type SpawnSyncReturns } from "node:child_process";
import { findDirWithFileRecursive } from "./find.js";

async function main(): Promise<void> {
  for (const project of await findDirWithFileRecursive("tsconfig.json"))
    try {
      console.log(`🔄 ${project}`);
      execSync("npx tsc --noEmit", {
        cwd: project,
        stdio: "inherit",
      });
      console.log(`☑️ ${project}`);
    } catch (e: any) {
      const { error } = e as SpawnSyncReturns<Buffer>;
      console.error(
        `error checking project ${project}: "${error?.message ?? ""}"`
      );
      process.exitCode = 255;
    }
}

main();
