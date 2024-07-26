import { features } from "web-features";
import { computeBaseline } from "compute-baseline";

import type { Doc } from "../libs/types/document.js";

export function addBaseline(doc: Partial<Doc>) {
  if (doc.browserCompat && !doc.mdn_url?.includes("/docs/MDN/")) {
    if (doc.browserCompat.length !== 1) {
      return;
    }

    const key = doc.browserCompat[0];
    const { featureStatus, keyStatus } = getStatuses(key);

    if (!featureStatus) {
      return;
    }

    if (featureStatus.baseline !== keyStatus.baseline) {
      return;
    }

    return featureStatus;
  }
}

function getStatuses(key: string) {
  for (const feature of Object.values(features)) {
    if (feature.status && feature.compat_features?.includes(key)) {
      return {
        featureStatus: feature.status,
        keyStatus: computeBaseline({ compatKeys: [key] }),
      };
    }
  }
  return {};
}
