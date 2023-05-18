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
  // This has to match what we do in server/index.js in the catchall handler
  app.use("**/*.(png|webp|gif|jpe?g|svg)", proxy);
  // All those root-level images like /favicon-48x48.png
  app.use("/*.(png|webp|gif|jpe?g|svg)", proxy);
}

export default config;
