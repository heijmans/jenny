export interface JobSummary {
  _class: string;
  color: string;
  name: string;
}

export interface JobDetails {
  jobs: JobSummary[];
}

export interface Stage {
  id: string;
  name: string;
  status: string;
  startTimeMillis: number;
  durationMillis: number;
}

export interface Run {
  id: string;
  name: string;
  status: string;
  stages: Stage[];
  startTimeMillis: number;
  endTimeMillis: number;
  durationMillis: number;
}

export interface Artifact {
  relativePath: string;
}

export interface RunMeta {
  artifacts: Artifact[];
}

export interface TestCase {
  name: string;
  duration: number;
  errorDetails?: string;
  errorStackTrace?: string;
  failedSince: number;
  status: 'PASSED' | 'SKIPPED' | 'FAILED' | 'FIXED';
  stderr?: string;
  stdout?: string;
  suiteName?: string; // generated
}

export interface TestSuite {
  name: string;
  nodeId: string;
  duration: number;
  cases: TestCase[];
}

export interface TestReport {
  duration: number;
  empty: boolean;
  failCount: number;
  passCount: number;
  skipCount: number;
  suites: TestSuite[];
}
