export function createPongGetHandler(
  client: any,
  coder: any,
  env: any
): (
  body: any,
  countryCode: any,
  userAgent: any
) => Promise<{
  statusCode: number;
  payload: any;
}>;
