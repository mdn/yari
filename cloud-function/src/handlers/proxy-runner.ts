import {
  legacyCreateProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withRunnerResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";

const target = sourceUri(Source.content);

export const proxyRunner = legacyCreateProxyMiddleware({
  target,
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        withRunnerResponseHeaders(proxyRes, req, res);
        return responseBuffer;
      }
    ),
  },
});
