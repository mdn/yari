const fs = require("fs");
const path = require("path");
const { Repository } = require("nodegit");

const PROJECT_ROOT = path.join(__dirname, "..");
const SHA_PATH = path.join(PROJECT_ROOT, "content.gitsha");
const CONTENT_NAME = "stumptown";

async function retrieveLocalVersion() {
  const repository = await Repository.open(
    path.join(PROJECT_ROOT, CONTENT_NAME)
  );
  const commit = await repository.getHeadCommit();
  return commit.sha();
}

async function retrieveRemoteVersion() {
  const repository = await Repository.open(PROJECT_ROOT);
  const submodule = (await repository.getSubmodules()).find(
    submodule => submodule.name() === CONTENT_NAME
  );
  return submodule ? submodule.headId().toString() : null;
}

async function writeContentVersion() {
  fs.writeFileSync(SHA_PATH, await retrieveLocalVersion());
}

const VersionStatus = Object.freeze({
  ALL_GOOD: 0,
  REMOTE_CHANGES: 1,
  OLD_BUILD: 2
});

async function checkContentVersion() {
  const remoteVersion = await retrieveRemoteVersion();
  const localVersion = await retrieveLocalVersion();

  if (remoteVersion !== localVersion) {
    return VersionStatus.REMOTE_CHANGES;
  }

  if (
    !fs.existsSync(SHA_PATH) ||
    fs.readFileSync(SHA_PATH, "utf-8").trim() !== localVersion
  ) {
    return VersionStatus.OLD_BUILD;
  }

  return VersionStatus.ALL_GOOD;
}

module.exports = { writeContentVersion, checkContentVersion, VersionStatus };
