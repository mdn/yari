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
  // This must match extensions in libs/constant/index.js:156-161, or it won't work on the dev server.
  app.use(`**/*.(gif|jpeg|jpg|mp3|mp4|ogg|png|svg|webm|webp|woff2)`, proxy);
  // All those root-level images like /favicon-48x48.png
  app.use("/*.(png|webp|gif|jpe?g|svg)", proxy);
}

export default config;
