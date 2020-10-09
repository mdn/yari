const { createProxyMiddleware } = require("http-proxy-middleware");

console.log("Setting up a Proxy to localhost:9200");
module.exports = function (app) {
  app.use(
    "/mdn_documents",
    createProxyMiddleware({
      target: "http://localhost:9200",
      changeOrigin: true,
    })
  );
};
