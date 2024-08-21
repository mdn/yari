interface AssetManifest {
  files: Record<string, string>;
  entrypoints: string[];
}

export const WEBFONT_URLS: string[];
export const GTAG_PATH: null | string;
export const BASE_URL: string;
export const ALWAYS_ALLOW_ROBOTS: boolean;
export const ASSET_MANIFEST: AssetManifest;
