const { createProxyMiddleware } = require("http-proxy-middleware");

console.log("Setting up a Proxy to localhost:5000");
module.exports = function (app) {
  const proxy = createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
  });
  app.use("/api", proxy);
  app.use("**/index.json", proxy);
  // This has to match what we do in server/index.js in the catchall handler
  app.use("**/*.(png|webp|gif|jpe?g|svg)", proxy);
};
