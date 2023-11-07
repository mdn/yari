export function isExternalUrl(url: string) {
  return url.startsWith("//") || !url.startsWith("/");
}
