import { create } from 'zustand';
import { CareerPassport, JobPosting, DynamicMatchScore } from '@/lib/types';
import { diagnoseJobRisks } from '@/lib/scanner';
import { MOCK_JOB_DATABASE } from '@/lib/matcher';

export type TabId = "passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger";
export type RadarFilterId =
  | "all" | "entry" | "tech" | "finance" | "marketing" | "hr" | "planning"
  | "exclusive" | "consulting" | "public" | "conglomerate" | "globalTech"
  | "tierA" | "highMatch" | "commuteFit" | "nonOT";

export interface OfferScenario {
  label: string;
  baseManwon: number;
  allowanceManwon: number;
  commuteMinutesOneway: number;
  weeklyRemoteDays: number;
  weeklyWorkHours: number;
  hasFixedOT: boolean;
  fixedOTHours: number;
}

let toastTimer: ReturnType<typeof setTimeout> | null = null;

interface AppState {
  jobsDatabase: JobPosting[];
  setJobsDatabase: (jobs: JobPosting[]) => void;

  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  showToast: (msg: string) => void;

  passport: CareerPassport;
  setPassport: (passport: CareerPassport | ((prev: CareerPassport) => CareerPassport)) => void;

  calcInput: {
    cashManwon: number;
    commuteMinutesOneway: number;
    monthlyTransitCostManwon: number;
    weeklyRemoteDays: number;
    weeklyWorkHours: number;
  };
  setCalcInput: (
    input:
      | AppState['calcInput']
      | ((prev: AppState['calcInput']) => AppState['calcInput'])
  ) => void;

  offerA: OfferScenario;
  offerB: OfferScenario;
  setOfferA: (offer: Partial<OfferScenario>) => void;
  setOfferB: (offer: Partial<OfferScenario>) => void;

  scannerText: string;
  setScannerText: (text: string) => void;
  scanResult: ReturnType<typeof diagnoseJobRisks> | null;
  setScanResult: (result: ReturnType<typeof diagnoseJobRisks> | null) => void;

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

  selectedJob: JobPosting | null;
  setSelectedJob: (job: JobPosting | null) => void;
  selectedJobMatch: DynamicMatchScore | null;
  setSelectedJobMatch: (match: DynamicMatchScore | null) => void;
  selectedJobHf: { isExcluded: boolean; exclusionReasons: string[] } | null;
  setSelectedJobHf: (hf: { isExcluded: boolean; exclusionReasons: string[] } | null) => void;

  customKeywordInput: string;
  setCustomKeywordInput: (input: string) => void;
  showExcludedJobs: boolean;
  setShowExcludedJobs: (show: boolean) => void;
  radarSearch: string;
  setRadarSearch: (search: string) => void;
  radarFilter: RadarFilterId;
  setRadarFilter: (filter: RadarFilterId) => void;
  ledgerSearch: string;
  setLedgerSearch: (search: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  jobsDatabase: MOCK_JOB_DATABASE,
  setJobsDatabase: (jobs) => set({ jobsDatabase: jobs }),

  activeTab: "passport",
  setActiveTab: (tab) => set({ activeTab: tab }),

  toastMessage: null,
  setToastMessage: (msg) => set({ toastMessage: msg }),
  showToast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: msg });
    toastTimer = setTimeout(() => {
      set({ toastMessage: null });
    }, 3500);
  },

  passport: {
    track: "EXPERIENCED",
    occupation: "HR",
    canonicalRole: "인사기획 (HR Planning)",
    totalYears: 7,
    companyType: "중견기업",
    baseSalary: 5400,
    fixedAllowance: 400,
    variableBonus: 500,
    hasFixedOT: true,
    homeLocation: "경기도 군포시 (산본동)",
    commuteToleranceMinutes: 60,
    skills: ["인사기획", "평가보상체계설계", "노무관리", "임금피크제", "직무분석", "AX(AI Transformation)"],
    hardFilters: {
      onlyPermanent: true,
      onlyCapitalArea: true,
      maxCommuteCutoff: true,
      noHeavyFixedOT: false,
      noBelowCurrentSalary: false,
      noRelocationOrg: true,
      customKeywords: ["교대근무", "파견직", "일용직"],
    },
    hardPreferences: { employmentType: "정규직", region: "수도권" },
    softPreferences: { wfhPreferred: true, minSalary: 5500 },
    updatedAt: "2026-10-07T00:00:00.000Z",
  },
  setPassport: (updater) =>
    set((state) => ({
      passport: typeof updater === "function" ? updater(state.passport) : updater,
    })),

  calcInput: {
    cashManwon: 5800,
    commuteMinutesOneway: 50,
    monthlyTransitCostManwon: 12,
    weeklyRemoteDays: 1,
    weeklyWorkHours: 48,
  },
  setCalcInput: (input) =>
    set((state) => ({
      calcInput: typeof input === "function" ? input(state.calcInput) : input,
    })),

  offerA: {
    label: "Offer A (대기업)",
    baseManwon: 6200,
    allowanceManwon: 400,
    commuteMinutesOneway: 75,
    weeklyRemoteDays: 0,
    weeklyWorkHours: 52,
    hasFixedOT: true,
    fixedOTHours: 32,
  },
  offerB: {
    label: "Offer B (핀테크/테크)",
    baseManwon: 5800,
    allowanceManwon: 400,
    commuteMinutesOneway: 40,
    weeklyRemoteDays: 2,
    weeklyWorkHours: 42,
    hasFixedOT: false,
    fixedOTHours: 0,
  },
  setOfferA: (offer) => set((state) => ({ offerA: { ...state.offerA, ...offer } })),
  setOfferB: (offer) => set((state) => ({ offerB: { ...state.offerB, ...offer } })),

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
  activeSkillTrackId: "",
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
  radarFilter: "all",
  setRadarFilter: (filter) => set({ radarFilter: filter }),
  ledgerSearch: "",
  setLedgerSearch: (search) => set({ ledgerSearch: search }),
}));
