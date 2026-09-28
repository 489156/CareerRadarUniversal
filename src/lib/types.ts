export type OccupationType = 'HR' | 'PLANNING' | 'TECH' | 'MARKETING' | 'FINANCE';

export interface CareerPassport {
  id?: string;
  occupation: OccupationType;
  canonicalRole: string;
  totalYears: number;
  companyType: string;
  baseSalary: number; // 단위: 만 원
  fixedAllowance: number; // 단위: 만 원
  variableBonus: number; // 단위: 만 원
  hasFixedOT: boolean;
  homeLocation: string;
  commuteToleranceMinutes: number;
  skills: string[];
  hardPreferences: {
    employmentType: string;
    region: string;
  };
  softPreferences: {
    wfhPreferred: boolean;
    minSalary: number;
  };
  updatedAt: string;
}

export type ConfidenceTier = 'A' | 'B' | 'C' | 'D';

export interface JobPosting {
  id: string;
  company: string;
  title: string;
  canonicalRole: string;
  location: string;
  commuteMinutes: number;
  salaryDisplay: string;
  salaryTier: ConfidenceTier;
  fitScore: number;
  hasFixedOT: boolean;
  fixedOTHours: number;
  tags: string[];
  pros: string[];
  gaps: string[];
  sourceUrl?: string;
}

export interface SalaryBenchmark {
  id: string;
  org: string;
  role: string;
  tier: ConfidenceTier;
  salary: string;
  note: string;
  date: string;
}

export interface LaborRiskWarning {
  type: 'danger' | 'warning' | 'info';
  title: string;
  desc: string;
}

export interface LaborRiskDiagnosis {
  isClean: boolean;
  hasFixedOT: boolean;
  fixedOTHours: number;
  hasSeveranceSplitRisk: boolean;
  probationReducedSalary: boolean;
  warnings: LaborRiskWarning[];
}

export interface LifeAdjustedInput {
  cashManwon: number;
  commuteMinutesOneway: number;
  monthlyTransitCostManwon: number;
  weeklyRemoteDays: number;
  weeklyWorkHours: number;
}

export interface LifeAdjustedOutput {
  nominalHourlyWage: number;
  realHourlyWage: number;
  annualCommuteHours: number;
  annualCommuteCostWon: number;
  totalLifeHoursInvested: number;
  utilityVerdictText: string;
}
