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
  const uri = request.uri.toLowerCase();

  // This condition exists to accommodate AWS origin-groups, which
  // include two origins, the primary and the secondary, where the
  // secondary origin is only attempted if the primary fails. Since
  // origin groups introduce multiple origins for the same CloudFront
  // behavior, we have to ensure we only make adjustments for custom
  // S3 origins.
  if (
    request.origin.custom &&
    request.origin.custom.domainName.includes("s3")
  ) {
    // The live-sample pages should never respond with an X-Frame-Options
    // header, because they're explicitly created for rendering within an
    // iframe on a different origin.
    if (!uri.includes("/_samples_/")) {
      response.headers["x-frame-options"] = [
        { key: "X-Frame-Options", value: "DENY" },
      ];
    }
    response.headers["x-xss-protection"] = [
      { key: "X-XSS-Protection", value: "1; mode=block" },
    ];
    response.headers["x-content-type-options"] = [
      { key: "X-Content-Type-Options", value: "nosniff" },
    ];
    response.headers["strict-transport-security"] = [
      { key: "Strict-Transport-Security", value: "max-age=63072000" },
    ];
  }

  return response;
};
