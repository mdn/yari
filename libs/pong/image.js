/* global fetch */
export async function fetchImage(src) {
  const imageResponse = await fetch(src);
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type");
  return { buf: imageBuffer, contentType };
}
