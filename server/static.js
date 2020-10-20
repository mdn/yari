/**
 * THIS NEEDS AN EXPLANATION
 */

const express = require("express");
const compression = require("compression");

const { staticMiddlewares } = require("./middlewares");
const { resolveFundamental } = require("../content");

const app = express();
app.use(express.json());
app.use(compression());

app.use((req, res, next) => {
  // If we have a fundamental redirect mimic out Lambda@Edge and redirect.
  const { url: fundamentalRedirectUrl, status } = resolveFundamental(req.url);
  if (fundamentalRedirectUrl && status) {
    return res.redirect(status, fundamentalRedirectUrl);
  }
  return next();
});

app.use(staticMiddlewares);

const PORT = parseInt(process.env.SERVER_PORT || "5000");
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
