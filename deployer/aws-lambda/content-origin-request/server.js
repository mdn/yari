const express = require("express");
const kleur = require("kleur");

const { handler } = require("./index");

const app = express();
const PORT = 7000;

app.get("/ping", async (req, res) => {
  res.send("pong\n");
});

app.get("/*", async (req, res) => {
  // Reminder...
  // - url: e.g. `/en-US/docs/Foo?key=value`
  // - query: e.g. `?key=value`
  const { url, query } = req;
  const uri = url.split("?")[0];
  console.log(`Simulating a request for: ${url}`);

  const event = {};
  const origin = {};
  origin.custom = {};
  // This always pretends to proceed and do a S3 lookup
  origin.custom.domainName =
    req.headers["ORIGIN_DOMAIN_NAME"] || "s3.fakey.fake";
  const cf = {};
  const headers = {};
  headers.host = [{ value: req.hostname }];
  for (const [key, value] of Object.entries(req.headers)) {
    headers[key] = [{ value }];
  }
  cf.request = {
    uri,
    querystring: query,
    origin,
    headers,
  };

  event.Records = [{ cf }];
  // console.log("EVENT...");
  // console.log(event);
  // console.log(JSON.stringify(event, null, 3));
  const handle = await handler(event);
  if (handle === cf.request) {
    // The request is allowed to pass through.
    // The URL might have been mutated.
    const msg = `Looking up ${kleur.white().bold(handle.uri)} in S3!`;
    console.log(msg);
    // This is unrealistic but helpful if you want to write some integration
    // tests against this test server if you're interesting in seeing that
    // would happen next.
    res.setHeader("X-S3-Lookup", handle.uri);
    res.send(msg);
  } else if (handle.status) {
    // It's a redirect.
    // console.log(JSON.stringify(handle, null, 3));
    let path = null;
    for (const headers of Object.values(handle.headers)) {
      for (const header of headers) {
        res.setHeader(header.key, header.value);
        if (header.key.toLowerCase() === "location") {
          path = header.value;
        }
      }
    }
    console.log(
      `${
        handle.status === 302
          ? kleur.green(handle.status)
          : kleur.yellow(handle.status)
      } redirect to ${kleur.bold(path)}`
    );
    res.redirect(handle.status, path);
  } else {
    console.warn(JSON.stringify(handle, null, 3));
    res.status(500, "Unrecognized handler response");
  }
});

app.listen(PORT, () => {
  console.log(
    `content-origin-request simulator started on http://localhost:${PORT}`
  );
});
