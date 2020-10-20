// These functions are called from the origin-request Lambda@Edge
// but only when it's appropriate. It makes it possible for us to
// see how Yari, in dev builds, would behave if the v1 API responded
// in particular ways.
// Remember that this function needs to be able to work in Lambda@Edge
// so you can't rely on module imports like you can in the regular
// dev server.

function fakeWhoami(request) {
  return {
    status: 200,
    statusDescription: "OK",
    headers: {
      "cache-control": [
        {
          key: "Cache-Control",
          value: "max-age=0, no-cache, no-store, must-revalidate",
        },
      ],
      "content-type": [
        {
          key: "Content-Type",
          value: "application/json",
        },
      ],
    },
    body: JSON.stringify(payloadFromQuerystring(request.querystring)),
  };
}

function payloadFromQuerystring(querystring) {
  const sp = new URLSearchParams(querystring);
  const payload = {
    waffle: {
      flags: {},
      switches: {},
      samples: {},
    },
  };
  for (const [key, value] of sp) {
    if (key.startsWith("_whoami.")) {
      key
        .replace("_whoami.", "")
        .split(".")
        .reduce((r, e, i, arr) => {
          return (r[e] = r[e] || (arr[i + 1] ? {} : value));
        }, payload);
    }
  }

  return payload;
}

module.exports = {
  fakeWhoami,
};
