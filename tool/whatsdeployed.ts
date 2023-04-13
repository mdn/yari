import child_process from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

export async function whatsdeployed(
  directory: string,
  output: string,
  dryRun = false
): Promise<void> {
  const command = "git log -n 1 --format='%H\t%ad'";
  console.info(`Executing ${command} in ${directory}`);

  const stdout = await new Promise<string>((resolve, reject) =>
    child_process.exec(
      command,
      {
        cwd: directory,
        encoding: "utf-8",
      },
      (error: child_process.ExecException, stdout: string) => {
        error ? reject(error) : resolve(stdout);
      }
    )
  );

  const [commit, date] = stdout.trim().split("\t");

  if (date && commit) {
    const data = { commit, date };

    if (dryRun) {
      console.info(`Write ${JSON.stringify(data)} to ${output}`);
    } else {
      const outputDir = path.dirname(output);
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(output, JSON.stringify(data, null, 2));
      console.info(`Wrote ${JSON.stringify(data)} to ${output}`);
    }
  } else {
    throw new Error("'commit' and 'date' not found in git log output");
  }
}
