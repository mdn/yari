import { createHmac } from "node:crypto";

export class Coder {
  /**
   * The signing secret.
   * @type {string}
   */
  signSecret: string;

  /**
   * Create a Coder to en/decode and sign/verify fields.
   * @param {string} signSecret - The signing secret.
   */
  constructor(signSecret) {
    this.signSecret = signSecret;
  }
  encodeAndSign(s = ""): string {
    const hmac = createHmac("sha256", this.signSecret);
    hmac.update(s);
    return `${Buffer.from(s, "utf-8").toString("base64")}.${hmac.digest(
      "base64"
    )}`;
  }

  decodeAndVerify(tuple = ""): string | null {
    if (tuple === null) {
      return null;
    }
    const [encoded, digest] = tuple.split(".");
    const s = Buffer.from(encoded, "base64").toString("utf-8");
    const hmac = createHmac("sha256", this.signSecret);
    hmac.update(s);
    if (hmac.digest("base64") == digest) {
      // === won't work...
      return s;
    }
    return null;
  }
}
