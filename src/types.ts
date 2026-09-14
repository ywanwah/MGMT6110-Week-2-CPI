export interface CpiLatest {
  period: string;
  value: number;
  unit: string;
  momPercent: number;
  yoyPercent: number;
  momChange: number;
  yoyChange: number;
  prevPeriod: string | null;
  yoyPeriod: string | null;
}

export interface MonthlyDataPoint {
  period: string;
  value: number;
}

export interface CategoryData {
  seriesNo: string;
  name: string;
  value: number | null;
  unit: string;
  momPercent: number | null;
  yoyPercent: number | null;
}

export interface CpiResponse {
  empty: boolean;
  resourceId: string;
  title: string;
  frequency: string;
  baseYear: string;
  datasource: string;
  dataLastUpdated: string | null;
  footnote?: string;
  latest: CpiLatest;
  recentMonthly: MonthlyDataPoint[];
  categories: CategoryData[];
}

export interface HealthResponse {
  keyConfigured: boolean;
  upstreamAnswered: boolean;
  upstreamStatus: number | null;
  ok?: boolean;
  message?: string;
  error?: string;
  variable?: string;
}

export type FetchState =
  | { status: 'loading'; sentence: string }
  | { status: 'empty'; sentence: string }
  | { status: 'refused'; statusNum: number; sentence: string; reason?: string }
  | { status: 'unreachable'; sentence: string; reason?: string }
  | { status: 'success'; data: CpiResponse };
