import { features } from "web-features";
import { computeBaseline } from "compute-baseline";

import type { Doc } from "../libs/types/document.js";

export function addBaseline(doc: Partial<Doc>) {
  if (
    doc.browserCompat &&
    doc.browserCompat.length == 1 &&
    !doc.mdn_url?.includes("/docs/MDN/")
  ) {
    const bcdKey = doc.browserCompat[0];
    const { featureStatus, keyStatus } = getStatuses(bcdKey);

    if (!featureStatus) {
      return;
    }

    if (featureStatus.baseline !== keyStatus.baseline) {
      return;
    }

    return featureStatus;
  }
}

function getStatuses(bcdKey: string) {
  for (const feature of Object.values(features)) {
    if (feature.status && feature.compat_features?.includes(bcdKey)) {
      return {
        featureStatus: feature.status,
        keyStatus: computeBaseline({ compatKeys: [bcdKey] }),
      };
    }
  }
  return {};
}
