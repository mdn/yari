/**
 * THIS NEEDS AN EXPLANATION
 */

const express = require("express");

const { staticMiddlewares } = require("./middlewares");
const { resolveFundamental } = require("../content");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  // If we have a fundamental redirect mimic out Lambda@Edge and redirect.
  const { url: fundamentalRedirectUrl, status } = resolveFundamental(req.url);
  if (fundamentalRedirectUrl && status) {
    return res.redirect(status, fundamentalRedirectUrl);
  }
  return next();
});

app.use(staticMiddlewares);

// Used by CI to make sure the server is up and running
app.get("/_ping", (req, res) => {
  res.send("pong\n");
});

const PORT = parseInt(process.env.SERVER_PORT || "5000");
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
