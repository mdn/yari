import { Coder } from "./coding.js";

export function createPongClickHandler(coder: Coder): (
  params: URLSearchParams
) => Promise<{
  status: number;
  location: string;
}>;
