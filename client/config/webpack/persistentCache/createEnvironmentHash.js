import { createHash } from "node:crypto";

const createEnvironmentHash = (env) => {
  const hash = createHash("md5");
  hash.update(JSON.stringify(env));

  return hash.digest("hex");
};

export default createEnvironmentHash;
