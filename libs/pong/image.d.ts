export function fetchImage(src: string): Promise<{
  buf: ArrayBuffer;
  contentType: string;
}>;
