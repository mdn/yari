import { Coder } from "./coding.js";

export function createPongViewedHandler(
  coder: Coder
): (params: URLSearchParams) => Promise<void>;
