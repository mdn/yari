import {
  legacyCreateProxyMiddleware,
  fixRequestBody,
} from "http-proxy-middleware";

import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";

export const proxyApi = legacyCreateProxyMiddleware({
  target: sourceUri(Source.api),
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  on: {
    proxyReq: fixRequestBody,
  },
});
