/** @import { IncomingMessage, ServerResponse } from "http" */
/** @import * as express from "express" */
/**
 * @typedef State
 * @property {string} html
 * @property {string} css
 * @property {string} js
 * @property {string} [src]
 */
/**
 * @param {ServerResponse<IncomingMessage>} res
 */
export function withRunnerResponseHeaders(
  res: ServerResponse<IncomingMessage>
): void;
/**
 * @param {State | null} state
 * @param {string} hrefWithCode
 * @param {string} searchWithState
 */
export function renderWarning(
  state: State | null,
  hrefWithCode: string,
  searchWithState: string
): string;
/**
 * @param {State | null} [state=null]
 */
export function renderHtml(state?: State | null | undefined): string;
/**
 * @param {string | null} base64String
 */
export function decompressFromBase64(base64String: string | null): Promise<
  | {
      state: null;
      hash: null;
    }
  | {
      state: string;
      hash: string;
    }
>;
/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
export function handleRunner(
  req: express.Request,
  res: express.Response
): Promise<express.Response<any, Record<string, any>>>;
export const ORIGIN_PLAY: string;
export const ORIGIN_MAIN: string;
export const PLAYGROUND_UNSAFE_CSP_VALUE: string;
export type State = {
  html: string;
  css: string;
  js: string;
  src?: string | undefined;
};
import type { IncomingMessage } from "http";
import type { ServerResponse } from "http";
import type * as express from "express";
