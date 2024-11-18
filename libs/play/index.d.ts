/** @import { IncomingMessage, ServerResponse } from "http" */
/**
 * @typedef State
 * @property {string} html
 * @property {string} css
 * @property {string} js
 * @property {string} [src]
 */
/**
 * @param {IncomingMessage | null} _proxyRes
 * @param {IncomingMessage} _req
 * @param {ServerResponse<IncomingMessage>} res
 */
export function withRunnerResponseHeaders(
  _proxyRes: IncomingMessage | null,
  _req: IncomingMessage,
  res: ServerResponse<IncomingMessage>
): void;
/**
 * @param {State | null} [state=null]
 */
export function renderHtml(state?: State | null): string;
/**
 * @param {string | null} base64String
 */
export function decompressFromBase64(base64String: string | null): Promise<{
  state: string;
  hash: string;
}>;
export function handleRunner(req: any, res: any): Promise<any>;
export const ORIGIN_PLAY: string;
export const ORIGIN_MAIN: string;
export const PLAYGROUND_UNSAFE_CSP_VALUE: string;
export type State = {
  html: string;
  css: string;
  js: string;
  src?: string;
};
import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";
