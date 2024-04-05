import { execSync, type SpawnSyncReturns } from "node:child_process";
import { findDirWithFileRecursive } from "./find.js";

export async function installAllSubpackages(
  filename: string,
  command: string
): Promise<void> {
  for (const project of await findDirWithFileRecursive(filename)) {
    if (project == ".") continue;
    try {
      console.log(`+ ${command} [${project}]`);
      execSync(command, {
        cwd: project,
        stdio: "inherit",
      });
    } catch (e: any) {
      const { error } = e as SpawnSyncReturns<Buffer>;
      console.error(
        `error installing dependencies for ${project}: "${
          error?.message ?? ""
        }"`
      );
      process.exitCode = 255;
    }
  }
}
