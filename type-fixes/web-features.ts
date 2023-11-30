import features from "../node_modules/web-features/index.js";

export type Features = { [key: string]: FeatureData };

// Types below copied from web-platform-dx/web-features GitHub repo,
// with modifications to remove deprecated attributes:
// https://github.com/web-platform-dx/web-features/blob/4840030477896714dcc713d05b70bbcc15aa20d2/index.ts#L8-L48

export interface FeatureData {
  /** Alias identifier */
  alias?: string | [string, string, ...string[]];
  /** Specification */
  spec:
    | specification_url
    | [specification_url, specification_url, ...specification_url[]];
  /** caniuse.com identifier */
  caniuse?: string;
  /** Whether a feature is considered a "baseline" web platform feature and when it achieved that status */
  status?: SupportStatus;
  /** Sources of support data for this feature */
  compat_features?: string[];
  /** Usage stats */
  usage_stats?:
    | usage_stats_url
    | [usage_stats_url, usage_stats_url, ...usage_stats_url[]]; // A single URL or an array of two or more
}

type browserIdentifier =
  | "chrome"
  | "chrome_android"
  | "edge"
  | "firefox"
  | "firefox_android"
  | "safari"
  | "safari_ios";

type BaselineHighLow = "high" | "low";

export interface SupportStatus {
  /** Whether the feature is Baseline (low substatus), Baseline (high substatus), or not (false) */
  baseline?: BaselineHighLow | false;
  /** Date the feature achieved Baseline low status */
  baseline_low_date?: string;
  /** Browser versions that most-recently introduced the feature */
  support?: { [K in browserIdentifier]?: string };
}

/** Specification URL
 * @format uri
 */
type specification_url = string;

/** Usage stats URL
 * @format uri
 */
type usage_stats_url = string;

export default features as Features;
