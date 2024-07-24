import { features } from "web-features";

export function getWebFeatureStatus(...bcdKeys: string[]) {
  if (bcdKeys.length === 0) {
    return;
  }

  for (const feature of Object.values(features)) {
    if (
      feature.status &&
      feature.compat_features?.some((feature) => bcdKeys.includes(feature))
    ) {
      return feature.status;
    }
  }
}
