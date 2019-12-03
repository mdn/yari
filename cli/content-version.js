const fs = require("fs");
const path = require("path");
const { Repository } = require("nodegit");
const { HAS_CUSTOM_CONTENT, STUMPTOWN_CONTENT_ROOT } = require("ssr");

const PROJECT_ROOT = path.join(__dirname, "..");
const VERSION_FILE_PATH = path.join(PROJECT_ROOT, "content-versions.json");
const CONTENT_NAME = "stumptown";

async function retrieveLocalVersion() {
  const repository = await Repository.open(STUMPTOWN_CONTENT_ROOT);
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

function readContentVersions() {
  return fs.existsSync(VERSION_FILE_PATH)
    ? JSON.parse(fs.readFileSync(VERSION_FILE_PATH, "utf-8"))
    : {};
}

async function writeContentVersion() {
  const contentVersions = {
    ...readContentVersions(),
    [STUMPTOWN_CONTENT_ROOT]: await retrieveLocalVersion()
  };
  fs.writeFileSync(VERSION_FILE_PATH, JSON.stringify(contentVersions, null, 2));
}

const VersionStatus = Object.freeze({
  ALL_GOOD: 0,
  REMOTE_CHANGES: 1,
  OLD_BUILD: 2
});

async function checkContentVersion() {
  const localVersion = await retrieveLocalVersion();

  if (!HAS_CUSTOM_CONTENT && (await retrieveRemoteVersion()) !== localVersion) {
    return VersionStatus.REMOTE_CHANGES;
  }

  if (readContentVersions()[STUMPTOWN_CONTENT_ROOT] !== localVersion) {
    return VersionStatus.OLD_BUILD;
  }

  return VersionStatus.ALL_GOOD;
}

module.exports = {
  writeContentVersion,
  checkContentVersion,
  VERSION_FILE_PATH,
  VersionStatus
};
