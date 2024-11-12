/** @import { IncomingMessage, ServerResponse } from "http" */
/**
 * @typedef {State}
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
export type withRunnerResponseHeaders = State;
/**
 * @param {State | null} state
 * @param {string} href
 */
export function renderWarning(state: State | null, href: string): string;
/**
 * @param {State | null} [state=null]
 */
export function renderHtml(state?: State | null): string;
/**
 * @param {string | null} base64String
 */
export function decompressFromBase64(
  base64String: string | null
): Promise<string>;
/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function handleRunner(
  req: express.Request,
  res: express.Response
): Promise<express.Response<any, Record<string, any>>>;
export const PLAYGROUND_UNSAFE_CSP_VALUE: string;
import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";
import * as express from "express";
