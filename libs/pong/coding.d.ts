export class Coder {
  /**
   * Create a Coder to en/decode and sign/verify fields.
   * @param {string} signSecret - The signing secret.
   */
  constructor(signSecret: string);
  /**
   * The signing secret.
   * @type {string}
   */
  signSecret: string;
  encodeAndSign(s?: string): string;
  decodeAndVerify(tuple?: string): string | null;
}
