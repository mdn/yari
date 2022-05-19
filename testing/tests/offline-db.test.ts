// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'path'.
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'crypto'.
const crypto = require("crypto");

test("db.ts should be identical (PWA vs. Client)", () => {
  function sha256sum(path) {
    const content = fs.readFileSync(path);
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'createHash' does not exist on type 'Cryp... Remove this comment to see the full error message
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  const pwaDb = path.join("client", "pwa", "src", "db.ts");
  const clientDb = path.join("client", "src", "offline-settings", "db.ts");

  const [clientDbHash, pwaDbHash] = [clientDb, pwaDb].map(sha256sum);

  expect(clientDbHash).toEqual(pwaDbHash);
});
