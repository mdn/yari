import { WebFeature, WebFeatureStatus } from "../libs/types/document.js";
import { importJSON } from "./utils.js";

let promise: Promise<Record<string, WebFeature>> | null = null;

export async function getWebFeatures(): Promise<Record<string, WebFeature>> {
  if (!promise) {
    promise = importJSON<Record<string, WebFeature>>("web-features/index.json");
  }

  return promise;
}

export async function getWebFeatureStatus(
  ...features: string[]
): Promise<WebFeatureStatus | undefined> {
  if (features.length === 0) {
    return;
  }

  const webFeatures = await getWebFeatures();
  for (const feature of Object.values(webFeatures)) {
    if (
      feature.status &&
      feature.compat_features?.some((feature) => features.includes(feature))
    ) {
      return feature.status;
    }
  }
}
