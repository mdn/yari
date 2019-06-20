const path = require("path");
const child_process = require("child_process");

const gitclone = require("gitclone");
const simpleGit = require("simple-git");
const Octokit = require("@octokit/rest");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const NETLIFY_AUTH_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
if (!NETLIFY_AUTH_TOKEN) {
  throw new Error("process.env.NETLIFY_AUTH_TOKEN not set!");
}
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
if (!NETLIFY_SITE_ID) {
  throw new Error("process.env.NETLIFY_SITE_ID not set!");
}

const GITHUB_AUTH_TOKEN = process.env.GITHUB_AUTH_TOKEN;
if (!GITHUB_AUTH_TOKEN) {
  throw new Error("process.env.GITHUB_AUTH_TOKEN not set!");
}

// Location of the Netlify CLI executable
const NETLIFY_EXEC = "./node_modules/.bin/netlify";

// Where the git clone goes
const CHECKOUT_DIR = ".repo";
// Name of the git submodule that has the stumptown content
const STUMPTOWN_DIR_NAME = "stumptown";

function deployer(webhookData) {
  const data = {
    webhookData,
    checkoutDir: CHECKOUT_DIR
  };
  // console.log(JSON.stringify(webhookData.body, null, 4));
  gitclone("peterbe/mdn2", { dest: data.checkoutDir }, err => {
    // If it already existed, you'll get err.code===128
    if (err && err.code !== 128) {
      console.warn(err);
      console.warn(err.code);
      console.warn(err.buffer.toString());
    } else {
      processGitClone(data);
    }
  });
}

function _getRemoteOwner({ webhookData }) {
  // The webhookData might be a pull request or it might
  // be a push on master.
  return webhookData.repository.owner.login;
}

function _getRemoteCloneUrl({ webhookData }) {
  return webhookData.repository.clone_url;
}

function _getBranchName({ webhookData }) {
  return webhookData.pull_request.head.ref;
}

async function processGitClone(data) {
  const mainRepo = simpleGit(data.checkoutDir);
  await mainRepo.submoduleUpdate(["--init", "--recursive"]);
  console.log("After submodule update");

  const stumptownRepo = simpleGit(path.join(CHECKOUT_DIR, STUMPTOWN_DIR_NAME));

  const repoOwner = _getRemoteOwner(data);
  await stumptownRepo.addRemote(
    repoOwner,
    _getRemoteCloneUrl(data)
    // console.log
  );
  // await stumptownRepo.listRemote([], console.log);
  const branchName = _getBranchName(data);
  await stumptownRepo.fetch(repoOwner, branchName, console.log);
  const fullBranchName = `${repoOwner}/${branchName}`;
  await stumptownRepo.checkout(fullBranchName, console.log);

  buildDeployment(data);
}

function buildDeployment(data) {
  const childDeploymentBuild = child_process.exec(
    `cd ${data.checkoutDir} && make deployment-build`,
    (error, stdout, stderr) => {
      console.log("stdout: " + stdout);
      // console.log("stderr: " + stderr);
      if (error !== null) {
        console.warn("STDERR:", stderr);
        console.error("exec error: " + error);
        data.buildDeploymentError = error;
        githubPRComment(data);
      } else {
        console.log("Deployment Build worked!");
        netlifyDeploy(data);
      }
    }
  );

  // XXX This should be optional
  childDeploymentBuild.stdout.on("data", function(data) {
    console.log("DATA:", data.toString().trim());
  });
}

function netlifyDeploy(data) {
  const builtDir = path.join(data.checkoutDir, "client", "build");
  const deployMessage = "Deploy based on ${PR_URL}";
  let cmd = `${NETLIFY_EXEC} deploy --dir=${builtDir} --json `;
  cmd += `--site=${NETLIFY_SITE_ID} `;
  cmd += `--auth=${NETLIFY_AUTH_TOKEN} `;
  cmd += `--message="${deployMessage}" `;
  // if (webhookData.branch === "master") {
  //   cmd += "--prod ";
  // }
  console.log(
    "Netlify command:",
    cmd.replace(NETLIFY_AUTH_TOKEN, "$NETLIFY_AUTH_TOKEN")
  );
  const childNetlifyDeploy = child_process.exec(
    cmd,
    (error, stdout, stderr) => {
      if (error !== null) {
        console.error("Netlify deployment failed!");
        console.warn(error);
        console.warn(
          "STDERR:",
          stderr.replace(NETLIFY_AUTH_TOKEN, "$NETLIFY_AUTH_TOKEN")
        );
      } else {
        console.log("Netlify deployment build worked!");
        const netlifyOutput = JSON.parse(stdout);
        data.netlifyOutput = netlifyOutput;
        console.log(JSON.stringify(netlifyOutput, null, 2));
        githubPRComment(data);
        console.log("Done.");
      }
    }
  );
  // XXX This should be optional
  childNetlifyDeploy.stdout.on("data", function(data) {
    console.log("DATA:", data.toString().trim());
  });
}

function _getIssueCommentBody(data) {
  let body = "";
  if (data.netlifyOutput) {
    body += "✅ **Successfully deployed to Netlify!**\n\n";
    body += "Netlify deploy URL: " + data.netlifyOutput.deploy_url;
  } else if (data.buildDeploymentError) {
    body += "🚨 **Build deployment failed**\n\n";
    body += "<details><summary>Deployment error</summary>";
    body += data.buildDeploymentError;
    body += "</details>\n\n";
    body += "(Would be cool to try to extract the most useful error.";
  } else {
    body += "⚠️ **Webhook failed. Unknown error.**\n\n";
    body += "Check Lambda logs 😕";
  }
  body += "\n\n";
  return body;
}

async function githubPRComment(data) {
  const octokit = Octokit({
    auth: GITHUB_AUTH_TOKEN
  });

  if (!data.webhookData.pull_request) {
    throw new Error("Not yet supported!");
  }
  const baseRepoOwner = data.webhookData.pull_request.base.repo.owner.login;
  const baseRepoName = data.webhookData.pull_request.base.repo.name;
  const issueNumber = data.webhookData.pull_request.number;
  const body = _getIssueCommentBody(data);
  const res = await octokit.issues.createComment({
    owner: baseRepoOwner,
    repo: baseRepoName,
    issue_number: issueNumber,
    body
  });
  console.log("Result from creating comment:", res);
}

module.exports = { deployer };
