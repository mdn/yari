/* global fetch */
export async function fetchImage(src) {
  const res = await fetch(src);
  const status = res.status;
  const buf = await res.arrayBuffer();
  const contentType = res.headers.get("content-type");
  return { status, buf, contentType };
}
