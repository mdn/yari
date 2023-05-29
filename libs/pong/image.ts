/* global fetch */
export async function fetchImage(
  src: string
): Promise<{ buf: ArrayBuffer; contentType: string }> {
  const imageResponse = await fetch(src);
  const imageBuffer = await imageResponse.arrayBuffer();
  const contentType = imageResponse.headers.get("content-type");
  return { buf: imageBuffer, contentType };
}
