/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const polka = require("polka");
const kleur = require("kleur");

const { handler } = require("./index");

const PORT = parseInt(process.env.PORT || "7000");

function ping(req, res) {
  res.end("pong\n");
}

async function catchall(req, res) {
  // Reminder...
  // - url: e.g. `/en-US/docs/Foo?key=value`
  // - search: e.g. `?key=value`
  const { url } = req;
  let querystring = "";
  if (req.search) {
    querystring = req.search.split("?")[1];
  }
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
    querystring,
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
    res.end(`${msg}\n`);
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
    res.statusCode = handle.status;
    res.setHeader("Location", path);
    res.end("");
  } else {
    console.warn(JSON.stringify(handle, null, 3));
    res.statusCode = 500;
    res.end("Unrecognized handler response");
  }
}

polka()
  .get("/ping", ping)
  .head("/ping", ping)
  .get("/*", catchall)
  .head("/*", catchall)
  .listen(PORT, (err) => {
    if (err) {
      throw err;
    }
    console.log(
      `content-origin-request simulator started on http://localhost:${PORT}`
    );
  });
