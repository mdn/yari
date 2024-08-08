import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from "http-proxy-middleware";

import { withProxiedContentResponseHeaders } from "../headers.js";
import { Source, sourceUri } from "../env.js";
import { PROXY_TIMEOUT } from "../constants.js";
import { isLiveSampleURL } from "../utils.js";
import { renderHTMLForContext } from "./render-html.js";

import type { Request } from "express";

const target = sourceUri(Source.content);

export const proxyContent = createProxyMiddleware({
  target,
  changeOrigin: true,
  autoRewrite: true,
  proxyTimeout: PROXY_TIMEOUT,
  xfwd: true,
  selfHandleResponse: true,
  on: {
    proxyReq: fixRequestBody,
    proxyRes: responseInterceptor<Request>(
      async (responseBuffer, proxyRes, req, res) => {
        if (proxyRes.statusCode === 404 && !isLiveSampleURL(req.url ?? "")) {
          const html = await renderHTMLForContext(
            req,
            res,
            `${target}${req.url?.slice(1)}/index.json`
          );
          return Buffer.from(html);
        }

        withProxiedContentResponseHeaders(proxyRes, req, res);
        return responseBuffer;
      }
    ),
  },
});
