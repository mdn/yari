export interface ObservatoryAnalyzeRequest {
  host: string;
  hidden: boolean;
}

export type ObservatoryScanState =
  | "ABORTED"
  | "FAILED"
  | "FINISHED"
  | "PENDING"
  | "STARTING"
  | "RUNNING";

export interface ObservatoryResult {
  scan: ObservatoryScanResult;
  tests: ObservatoryTestResult;
  history: ObservatoryHistoryResult[];
}

export interface ObservatoryScanResult {
  algorithm_version: number;
  end_time: number;
  error: any;
  grade: string;
  hidden: boolean;
  id: number;
  likelihood_indicator: string;
  response_headers: Record<string, string>;
  score: number;
  site_id: number;
  start_time: number;
  state: ObservatoryScanState;
  status_code: number;
  tests_failed: number;
  tests_passed: number;
  tests_quantity: number;
}

export type ObservatoryTestResult = Record<string, ObservatoryIndividualTest>;

export interface ObservatoryIndividualTest {
  data: null | ObservatoryCookiesData;
  expectation: string;
  pass: boolean;
  result: string;
  score_description: string;
  score_modifier: number;
}

export interface ObservatoryHistoryResult {
  end_time: number;
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
