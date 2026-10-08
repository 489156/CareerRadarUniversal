import { create } from 'zustand';
import { CareerPassport, JobPosting, DynamicMatchScore } from '@/lib/types';
import { diagnoseJobRisks } from '@/lib/scanner';

interface AppState {
  // Global Data
  jobsDatabase: JobPosting[];
  setJobsDatabase: (jobs: JobPosting[]) => void;

  // UI State
  activeTab: "passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger";
  setActiveTab: (tab: "passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger") => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;

  // Passport State
  passport: CareerPassport;
  setPassport: (passport: CareerPassport | ((prev: CareerPassport) => CareerPassport)) => void;

  // Calculator State
  calcInput: {
    baseSalary: number;
    fixedAllowance: number;
    variableBonus: number;
    weeklyHours: number;
    weeklyOT: number;
    commuteMinutes: number;
    monthlyWelfare: number;
  };
  setCalcInput: (input: any) => void;

  // Scanner State
  scannerText: string;
  setScannerText: (text: string) => void;
  scanResult: ReturnType<typeof diagnoseJobRisks> | null;
  setScanResult: (result: ReturnType<typeof diagnoseJobRisks> | null) => void;

  // Modals
  isResumeModalOpen: boolean;
  setIsResumeModalOpen: (isOpen: boolean) => void;
  resumeText: string;
  setResumeText: (text: string) => void;

  isMarketValueModalOpen: boolean;
  setIsMarketValueModalOpen: (isOpen: boolean) => void;

  isSkillGapModalOpen: boolean;
  setIsSkillGapModalOpen: (isOpen: boolean) => void;
  activeSkillTrackId: string;
  setActiveSkillTrackId: (id: string) => void;

  isCrawlerModalOpen: boolean;
  setIsCrawlerModalOpen: (isOpen: boolean) => void;
  crawlerCategoryFilter: string;
  setCrawlerCategoryFilter: (category: string) => void;

  // Job Detail Modal State
  selectedJob: JobPosting | null;
  setSelectedJob: (job: JobPosting | null) => void;
  selectedJobMatch: DynamicMatchScore | null;
  setSelectedJobMatch: (match: DynamicMatchScore | null) => void;
  selectedJobHf: { isExcluded: boolean; exclusionReasons: string[] } | null;
  setSelectedJobHf: (hf: { isExcluded: boolean; exclusionReasons: string[] } | null) => void;

  // Filter & Search States
  customKeywordInput: string;
  setCustomKeywordInput: (input: string) => void;
  showExcludedJobs: boolean;
  setShowExcludedJobs: (show: boolean) => void;
  radarSearch: string;
  setRadarSearch: (search: string) => void;
  radarFilter: "ALL" | "RECOMMENDED" | "GOOD_COMMUTE" | "NO_OT" | "ENTRY";
  setRadarFilter: (filter: "ALL" | "RECOMMENDED" | "GOOD_COMMUTE" | "NO_OT" | "ENTRY") => void;
  ledgerSearch: string;
  setLedgerSearch: (search: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  jobsDatabase: [],
  setJobsDatabase: (jobs) => set({ jobsDatabase: jobs }),

  activeTab: "passport",
  setActiveTab: (tab) => set({ activeTab: tab }),

  toastMessage: null,
  setToastMessage: (msg) => set({ toastMessage: msg }),

  passport: {
    occupation: "HR",
    canonicalRole: "인사기획",
    totalYears: 7,
    companyType: "중견기업",
    baseSalary: 5400,
    fixedAllowance: 400,
    variableBonus: 500,
    hasFixedOT: false,
    homeLocation: "경기도 군포시",
    commuteToleranceMinutes: 60,
    skills: ["조직문화", "핵심인재 관리", "평가보상 기획", "HR Analytics", "노무 리스크 대응"],
    hardFilters: {
      onlyPermanent: true,
      onlyCapitalArea: true,
      maxCommuteCutoff: true,
      noHeavyFixedOT: false,
      noBelowCurrentSalary: false,
      noRelocationOrg: true,
      customKeywords: ["교대근무", "파견직"]
    },
    hardPreferences: { employmentType: "정규직", region: "수도권" },
    softPreferences: { wfhPreferred: false, minSalary: 5000 },
    updatedAt: new Date().toISOString()
  },
  setPassport: (updater) => set((state) => ({
    passport: typeof updater === 'function' ? updater(state.passport) : updater
  })),

  calcInput: {
    baseSalary: 6000,
    fixedAllowance: 0,
    variableBonus: 500,
    weeklyHours: 40,
    weeklyOT: 0,
    commuteMinutes: 60,
    monthlyWelfare: 10,
  },
  setCalcInput: (input) => set((state) => ({ calcInput: typeof input === 'function' ? input(state.calcInput) : input })),

  scannerText: "",
  setScannerText: (text) => set({ scannerText: text }),
  scanResult: null,
  setScanResult: (result) => set({ scanResult: result }),

  isResumeModalOpen: false,
  setIsResumeModalOpen: (isOpen) => set({ isResumeModalOpen: isOpen }),
  resumeText: "",
  setResumeText: (text) => set({ resumeText: text }),

  isMarketValueModalOpen: false,
  setIsMarketValueModalOpen: (isOpen) => set({ isMarketValueModalOpen: isOpen }),

  isSkillGapModalOpen: false,
  setIsSkillGapModalOpen: (isOpen) => set({ isSkillGapModalOpen: isOpen }),
  activeSkillTrackId: "track-analytics",
  setActiveSkillTrackId: (id) => set({ activeSkillTrackId: id }),

  isCrawlerModalOpen: false,
  setIsCrawlerModalOpen: (isOpen) => set({ isCrawlerModalOpen: isOpen }),
  crawlerCategoryFilter: "ALL",
  setCrawlerCategoryFilter: (category) => set({ crawlerCategoryFilter: category }),

  selectedJob: null,
  setSelectedJob: (job) => set({ selectedJob: job }),
  selectedJobMatch: null,
  setSelectedJobMatch: (match) => set({ selectedJobMatch: match }),
  selectedJobHf: null,
  setSelectedJobHf: (hf) => set({ selectedJobHf: hf }),

  customKeywordInput: "",
  setCustomKeywordInput: (input) => set({ customKeywordInput: input }),
  showExcludedJobs: false,
  setShowExcludedJobs: (show) => set({ showExcludedJobs: show }),
  radarSearch: "",
  setRadarSearch: (search) => set({ radarSearch: search }),
  radarFilter: "ALL",
  setRadarFilter: (filter) => set({ radarFilter: filter }),
  ledgerSearch: "",
  setLedgerSearch: (search) => set({ ledgerSearch: search }),
}));
