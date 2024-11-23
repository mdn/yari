import { PLAYGROUND_BASE_HOST } from "../env";

export const SESSION_KEY = "playground-session-code";

export interface EditorContent {
  css: string;
  html: string;
  js: string;
  src?: string;
}

export function codeToMarkdown(code: EditorContent): string {
  const parts: string[] = [];
  if (code.html) {
    parts.push(["```html", code.html, "```"].join("\n"));
  }
  if (code.css) {
    parts.push(["```css", code.css, "```"].join("\n"));
  }
  if (code.js) {
    parts.push(["```js", code.js, "```"].join("\n"));
  }
  return parts.join("\n\n");
}

export async function initPlayIframe(
  iframe: HTMLIFrameElement | null,
  editorContent: EditorContent | null,
  fullscreen: boolean = false
) {
  if (!iframe || !editorContent) {
    return;
  }
  const { state, hash } = await compressAndBase64Encode(
    JSON.stringify(editorContent)
  );
  const path = iframe.getAttribute("data-live-path");
  const host = PLAYGROUND_BASE_HOST.startsWith("localhost")
    ? PLAYGROUND_BASE_HOST
    : `${hash}.${PLAYGROUND_BASE_HOST}`;
  const url = new URL(
    `${path || ""}${path?.endsWith("/") ? "" : "/"}runner.html`,
    window.location.origin
  );
  url.host = host;
  url.search = "";
  url.searchParams.set("state", state);
  iframe.src = url.href;
  if (fullscreen) {
    const urlWithoutHash = new URL(window.location.href);
    urlWithoutHash.hash = "";
    window.history.replaceState(null, "", urlWithoutHash);
    window.location.href = url.href;
  }
}

function bytesToBase64(bytes: ArrayBuffer) {
  const binString = Array.from(new Uint8Array(bytes), (byte: number) =>
    String.fromCodePoint(byte)
  ).join("");
  return btoa(binString);
}

export async function compressAndBase64Encode(inputString: string) {
  const inputArray = new Blob([inputString]);

  const compressionStream = new CompressionStream("deflate-raw");

  const compressedStream = new Response(
    inputArray.stream().pipeThrough(compressionStream)
  ).arrayBuffer();

  const compressed = await compressedStream;
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", compressed);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 20);
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  const state = bytesToBase64(compressed);

  return { state, hash };
}

function base64ToBytes(base64: string): ArrayBuffer {
  const binString = atob(base64);
  const len = binString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function decompressFromBase64(base64String: string) {
  if (!base64String) {
    return { state: null, hash: null };
  }
  const bytes = base64ToBytes(base64String);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 20);
  const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const decompressionStream = new DecompressionStream("deflate-raw");

  const decompressedStream = new Response(
    new Blob([bytes]).stream().pipeThrough(decompressionStream)
  ).arrayBuffer();

  const state = new TextDecoder().decode(await decompressedStream);
  return { state, hash };
}
