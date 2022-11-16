import fs from "fs";
import path from "path";
import crypto from "crypto";

test("db.ts should be identical (PWA vs. Client)", () => {
  function sha256sum(path) {
    const content = fs.readFileSync(path);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  const pwaDb = path.join("client", "pwa", "src", "db.ts");
  const clientDb = path.join("client", "src", "settings", "db.ts");

  const [clientDbHash, pwaDbHash] = [clientDb, pwaDb].map(sha256sum);

  expect(clientDbHash).toEqual(pwaDbHash);
});
