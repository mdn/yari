// Runs from the root of the mdn/content checkout
// Requires `gh` CLI
// Requires `jq` CLI
// Requires `yq` CLI
// Known issues: it doesn't ignore completely new slugs

const child_process = require("child_process");

function main() {
  const arg = process.argv[2];
  const ghJSON = JSON.parse(
    child_process.execSync(`gh pr view ${arg} --json files`, {
      encoding: "utf-8",
    })
  );

  for (const file of ghJSON.files) {
    let notify = false;
    if (file.path.endsWith("index.md")) {
      const net = netDiffSize(file);
      if (!(net < 5)) {
        notify = true;
      }

      if (notify === true) {
        const slug = getSlug(file.path);
        console.log(`${arg}\t${slug}`);
        // TODO: post to notifications API endpoint
      }
    }
  }
}

function netDiffSize(file) {
  return file.additions - file.deletions;
}

function getSlug(path) {
  const cmd = `yq --front-matter=extract '.slug' ${path}`;
  return child_process.execSync(cmd, {
    encoding: "utf-8",
  });
}

main();
