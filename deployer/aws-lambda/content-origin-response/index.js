exports.handler = async (event) => {
  /*
   * Modify the response before it's cached by CloudFront.
   */
  const response = event.Records[0].cf.response;
  response.headers["x-frame-options"] = [
    { key: "X-Frame-Options", value: "DENY" },
  ];
  response.headers["strict-transport-security"] = [
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ];
  return response;
};
