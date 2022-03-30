// Runs from the root of the mdn/content checkout
// Requires `gh` CLI
// Requires `jq` CLI
// Requires `yq` CLI
// Known issues: it doesn't ignore completely new slugs

const child_process = require("child_process");

require("dotenv").config();

const { CONTENT_ROOT } = process.env;

function main() {
  const id = Number(process.argv[2]);
  processPR(id);
}

interface PullRequest {
  files: ChangedFile[];
}

interface ChangedFile {
  path: string;
  additions: number;
  deletions: number;
}

function processPR(id: number) {
  const ghJSON = JSON.parse(
    child_process.execSync(`gh pr view ${id} --json files`, {
      cwd: CONTENT_ROOT,
      encoding: "utf-8",
    })
  ) as PullRequest;

  for (const file of ghJSON.files) {
    let notify = false;
    if (file.path.endsWith("index.md")) {
      const net = netDiffSize(file);
      if (!(net < 5)) {
        notify = true;
      }

      if (notify === true) {
        const slug = getSlug(file.path);
        console.log(`${id}\t${slug}`);
        // TODO: post to notifications API endpoint
      }
    }
  }
}

function netDiffSize(file: ChangedFile) {
  return file.additions - file.deletions;
}

function getSlug(path: string) {
  const cmd = `yq --front-matter=extract '.slug' ${path}`;
  return child_process.execSync(cmd, {
    cwd: CONTENT_ROOT,
    encoding: "utf-8",
  });
}

main();
