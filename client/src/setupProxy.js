import { createProxyMiddleware } from "http-proxy-middleware";

const SERVER_PORT = process.env.SERVER_PORT || 5042;

console.log(`Setting up a Proxy to localhost:${SERVER_PORT}`);

function config(app) {
  const proxy = createProxyMiddleware(["!**/*.hot-update.json"], {
    target: `http://localhost:${SERVER_PORT}`,
    changeOrigin: true,
  });
  app.use("/api", proxy);
  app.use("/users", proxy);
  app.use("/pong", proxy);
  app.use("/pimg", proxy);
  app.use("/_+(flaws|translations|open|document)", proxy);
  // E.g. search-index.json or index.json
  app.use("**/*.json", proxy);
  // Always update libs/constant/index.js when adding/removing extensions!
  app.use(`**/*.(gif|jpeg|jpg|mp3|mp4|ogg|png|svg|webm|webp|woff2)`, proxy);
  // All those root-level images like /favicon-48x48.png
  app.use("/*.(png|webp|gif|jpe?g|svg)", proxy);

  const runnerProxy = createProxyMiddleware(["!**/*.hot-update.json"], {
    target: `http://localhost:${SERVER_PORT}`,
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      delete proxyRes.headers["clear-site-data"];
    },
  });
  // Proxy play runner
  app.use("**/runner.html", runnerProxy);
  // Proxy shared assets
  app.use("/shared-assets", proxy);
}

export default config;
