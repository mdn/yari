export function fetchImage(src: string): Promise<{
  status: number;
  buf: ArrayBuffer;
  contentType: string;
}>;
