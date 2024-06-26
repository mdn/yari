export interface ObservatoryAnalyzeRequest {
  host: string;
}

export type ObservatoryScanState =
  | "ABORTED"
  | "FAILED"
  | "FINISHED"
  | "PENDING"
  | "STARTING"
  | "RUNNING";

export const SCORING_TABLE = [
  { grade: "A+", scoreText: "100+", score: 100, stars: true },
  { grade: "A", scoreText: "90", score: 90, stars: true },
  { grade: "A-", scoreText: "85", score: 85, stars: true },
  { grade: "B+", scoreText: "80", score: 80 },
  { grade: "B", scoreText: "70", score: 70 },
  { grade: "B-", scoreText: "65", score: 65 },
  { grade: "C+", scoreText: "60", score: 60 },
  { grade: "C", scoreText: "50", score: 50 },
  { grade: "C-", scoreText: "45", score: 45 },
  { grade: "D+", scoreText: "40", score: 40 },
  { grade: "D", scoreText: "30", score: 30 },
  { grade: "D-", scoreText: "25", score: 25 },
  { grade: "F", scoreText: "0", score: 0 },
];

// Maintain consistent test sorting
export const SORTED_TEST_NAMES = [
  "content-security-policy",
  "cookies",
  "cross-origin-resource-sharing",
  "redirection",
  "referrer-policy",
  "strict-transport-security",
  "subresource-integrity",
  "x-content-type-options",
  "x-frame-options",
  "cross-origin-resource-policy",
];

export interface ObservatoryResult {
  scan: ObservatoryScanResult;
  tests: ObservatoryTestResult;
  history: ObservatoryHistoryResult[];
}

export interface GradeDistribution {
  grade: string;
  count: number;
}

export interface ObservatoryScanResult {
  algorithm_version: number;
  scanned_at: string;
  error?: string | null;
  grade?: string | null;
  id: number;
  response_headers?: Record<string, string>;
  score?: number;
  status_code?: number;
  tests_failed: number;
  tests_passed: number;
  tests_quantity: number;
}

export type ObservatoryTestResult = Record<string, ObservatoryIndividualTest>;

export interface ObservatoryIndividualTest {
  data: null | ObservatoryCookiesData;
  expectation: string;
  name: string;
  title: string;
  link: string;
  pass: boolean;
  result: string;
  score_description: string;
  recommendation: string;
  score_modifier: number;
  policy?: ObservatoryCSPPolicy;
  route?: string[];
}

export interface ObservatoryHistoryResult {
  scanned_at: string;
  grade: string;
  id: number;
  score: number;
}

export type ObservatoryCookiesData = Record<
  string,
  ObservatoryIndividualCookie
>;

export interface ObservatoryIndividualCookie {
  domain: string;
  expires: number;
  httponly: boolean;
  path: string;
  samesite: string;
  secure: boolean;
}

export interface ObservatoryPolicyItem {
  pass: boolean | null;
  description: string;
  info: string;
}

export interface ObservatoryCSPPolicy {
  antiClickjacking: ObservatoryPolicyItem;
  defaultNone: ObservatoryPolicyItem;
  insecureBaseUri: ObservatoryPolicyItem;
  insecureFormAction: ObservatoryPolicyItem;
  insecureSchemeActive: ObservatoryPolicyItem;
  insecureSchemePassive: ObservatoryPolicyItem;
  strictDynamic: ObservatoryPolicyItem;
  unsafeEval: ObservatoryPolicyItem;
  unsafeInline: ObservatoryPolicyItem;
  unsafeInlineStyle: ObservatoryPolicyItem;
  unsafeObjects: ObservatoryPolicyItem;
}
