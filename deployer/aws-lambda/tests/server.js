/* eslint-disable node/no-unpublished-require */
/* eslint-disable node/no-missing-require */
const polka = require("polka");
const kleur = require("kleur");

const requestHandler = require("../content-origin-request").handler;
const responseHandler = require("../content-origin-response").handler;

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
  console.log(req.headers);
  origin.custom.domainName =
    req.headers["origin_domain_name"] || "s3.fakey.fake";
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

  const responseHeaders = {};
  if (
    uri.endsWith(".html") ||
    !uri.split("/")[uri.split("/").length - 1].includes(".")
  ) {
    // Let's pretend the S3 lookup returned HTML
    responseHeaders["content-type"] = [{ value: "text/html" }];
  }
  cf.response = {
    headers: responseHeaders,
  };

  event.Records = [{ cf }];
  const handle = await requestHandler(event);

  if (handle === cf.request || handle.status) {
    const response = await responseHandler(event);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value[0].value);
    });
  }

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
    let location = null;
    for (const headers of Object.values(handle.headers || {})) {
      for (const header of headers) {
        res.setHeader(header.key, header.value);
        if (header.key.toLowerCase() === "location") {
          location = header.value;
        }
      }
    }
    if (handle.status >= 300 && handle.status < 400) {
      console.log(
        `${
          handle.status === 302
            ? kleur.green(handle.status)
            : kleur.yellow(handle.status)
        } redirect to ${kleur.bold(location)}`
      );
      if (location) {
        res.setHeader("Location", location);
      }
    } else if (handle.status >= 400) {
      console.log(
        `${
          handle.status >= 500
            ? kleur.red(handle.status)
            : kleur.yellow(handle.status)
        } '${handle.body.trim()}'`
      );
    } else {
      console.log(`${kleur.gree(handle.status)} '${handle.body.trim()}'`);
    }
    res.statusCode = handle.status;
    res.end(handle.body || "");
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
