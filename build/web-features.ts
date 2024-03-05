import webFeatures from "web-features";

export function getWebFeatureStatus(...features: string[]) {
  if (features.length === 0) {
    return;
  }

  for (const feature of Object.values(webFeatures)) {
    if (
      feature.status &&
      feature.compat_features?.some((feature) => features.includes(feature))
    ) {
      return feature.status;
    }
  }
}
