exports.handler = async (event) => {
  /*
   * This Lambda@Edge function is designed to handle origin-response
   * events, so for example we can modify the response before it's
   * cached by CloudFront. More specifically, when serving content
   * from S3, only a small set of common headers, like Cache-Control
   * and Content-Type, can be be associated and served with the content.
   * The other headers are added to the response here.
   */
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;

  // The live-sample pages should never respond with an X-Frame-Options
  // header, because they're explicitly created for rendering within an
  // iframe on a different origin.
  if (!request.uri.toLowerCase().includes("/_samples_/")) {
    response.headers["x-frame-options"] = [
      { key: "X-Frame-Options", value: "DENY" },
    ];
  }
  response.headers["strict-transport-security"] = [
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ];

  return response;
};
