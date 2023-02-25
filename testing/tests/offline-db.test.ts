import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

test("db.ts should be identical (PWA vs. Client)", async () => {
  async function sha256sum(path) {
    const content = await fs.readFile(path);
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  const pwaDb = path.join("client", "pwa", "src", "db.ts");
  const clientDb = path.join("client", "src", "settings", "db.ts");

  const [clientDbHash, pwaDbHash] = await Promise.all(
    [clientDb, pwaDb].map(sha256sum)
  );

  expect(clientDbHash).toEqual(pwaDbHash);
});
