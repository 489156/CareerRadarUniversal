"use client";

import React, { useEffect, useState } from "react";
import { useAppStore, TabId, RadarFilterId } from "@/store/useAppStore";
import { JobPosting, SalaryBenchmark, DynamicMatchScore, CareerPassport } from "@/lib/types";
import { calculateLifeAdjustedHourlyWage } from "@/lib/calculator";
import { diagnoseJobRisks } from "@/lib/scanner";
import {
  MOCK_JOB_DATABASE,
  calculateDynamicJobMatch,
  calculateSkillGapTracks,
  calculateEstimatedMarketValue,
  evaluateHardFilters,
  mapCompanyTypeToTier,
} from "@/lib/matcher";
import { CRAWLER_SOURCES } from "@/lib/crawler";
import { fetchJobsWithCache } from "@/lib/supabase";

import { IconSearch, IconCommand, IconExternal, IconChevronRight, IconClose } from "@/components/Icons";
import { CommandPalette } from "@/components/CommandPalette";
import { ResumeModal } from "@/components/ResumeModal";
import { MarketValueModal } from "@/components/MarketValueModal";
import { SkillGapModal } from "@/components/SkillGapModal";
import { CrawlerModal } from "@/components/CrawlerModal";
import { JobDetailModal } from "@/components/JobDetailModal";

const DEFAULT_ROLE_PRESETS: Record<string, { canonicalRole: string; skills: string[] }> = {
  HR: {
    canonicalRole: "인사기획 (HR Planning)",
    skills: ["인사기획", "평가보상체계설계", "노무관리", "조직문화", "AX(AI Transformation)"],
  },
  PLANNING: {
    canonicalRole: "경영전략 & 사업/서비스 기획 (PM)",
    skills: ["전략기획", "사업개발", "PM", "신사업", "컨설팅"],
  },
  TECH: {
    canonicalRole: "소프트웨어 엔지니어 (Backend / Frontend / Cloud)",
    skills: ["React", "TypeScript", "Java", "Spring", "Cloud"],
  },
  MARKETING: {
    canonicalRole: "그로스 & 퍼포먼스 마케팅",
    skills: ["그로스마케팅", "퍼포먼스 마케팅", "GA4", "CRM", "SQL"],
  },
  FINANCE: {
    canonicalRole: "재무·회계 & Deal Advisory (CPA)",
    skills: ["회계", "세무", "가치평가", "M&A", "자금"],
  },
};

export default function Home() {
  const {
    jobsDatabase,
    setJobsDatabase,
    activeTab,
    setActiveTab,
    toastMessage,
    setToastMessage,
    showToast,
    passport,
    setPassport,
    calcInput,
    setCalcInput,
    offerA,
    offerB,
    setOfferA,
    setOfferB,
    scannerText,
    setScannerText,
    scanResult,
    setScanResult,
    setIsResumeModalOpen,
    setIsMarketValueModalOpen,
    setIsSkillGapModalOpen,
    setIsCrawlerModalOpen,
    isCommandOpen,
    setIsCommandOpen,
    radarViewMode,
    setRadarViewMode,
    setSelectedJob,
    setSelectedJobMatch,
    setSelectedJobHf,
    customKeywordInput,
    setCustomKeywordInput,
    showExcludedJobs,
    setShowExcludedJobs,
    radarSearch,
    setRadarSearch,
    radarFilter,
    setRadarFilter,
    ledgerSearch,
    setLedgerSearch,
  } = useAppStore();

  const [newSkillInput, setNewSkillInput] = useState("");

  useEffect(() => {
    fetchJobsWithCache(MOCK_JOB_DATABASE).then((data) => {
      if (data && data.length > 0) setJobsDatabase(data);
    });
  }, [setJobsDatabase]);

  // Global Cmd+K / Ctrl+K & Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen(!isCommandOpen);
        return;
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
        setIsResumeModalOpen(false);
        setIsCrawlerModalOpen(false);
        setIsMarketValueModalOpen(false);
        setIsSkillGapModalOpen(false);
        setSelectedJob(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isCommandOpen,
    setIsCommandOpen,
    setIsResumeModalOpen,
    setIsCrawlerModalOpen,
    setIsMarketValueModalOpen,
    setIsSkillGapModalOpen,
    setSelectedJob,
  ]);

  // Hydrate passport from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("career_passport_universal");
      if (saved) {
        const p = JSON.parse(saved);
        setPassport((prev) => ({
          ...prev,
          ...p,
          hardFilters: p.hardFilters || prev.hardFilters,
        }));
        const totalCash = (parseInt(p.baseSalary, 10) || 0) + (parseInt(p.fixedAllowance, 10) || 0);
        if (totalCash > 0) {
          setCalcInput((prev) => ({ ...prev, cashManwon: totalCash }));
        }
      }
    } catch (e) {
      console.warn("localStorage not available:", e);
    }
  }, [setPassport, setCalcInput]);

  const handleSavePassport = () => {
    try {
      localStorage.setItem("career_passport_universal", JSON.stringify(passport));
      const totalCash = passport.baseSalary + passport.fixedAllowance;
      if (totalCash > 0) setCalcInput((prev) => ({ ...prev, cashManwon: totalCash }));
      showToast("커리어 조건이 저장되었습니다.");
    } catch {
      showToast("커리어 조건이 현재 세션에 반영되었습니다.");
    }
  };

  const setTrackPreset = (track: "ENTRY" | "EXPERIENCED") => {
    if (track === "ENTRY") {
      setPassport((prev) => ({
        ...prev,
        track: "ENTRY",
        totalYears: 0,
        baseSalary: 0,
        fixedAllowance: 0,
        variableBonus: 0,
        hardFilters: {
          ...prev.hardFilters,
          noBelowCurrentSalary: false,
          customKeywords: prev.hardFilters.customKeywords.filter((k) => k !== "인턴"),
        },
      }));
      setCalcInput((prev) => ({ ...prev, cashManwon: 4500 }));
      showToast("신입/인턴(0년차) 트랙으로 전환되었습니다.");
    } else {
      setPassport((prev) => ({
        ...prev,
        track: "EXPERIENCED",
        totalYears: prev.totalYears === 0 ? 5 : prev.totalYears,
        baseSalary: prev.baseSalary === 0 ? 5400 : prev.baseSalary,
        fixedAllowance: prev.fixedAllowance === 0 ? 400 : prev.fixedAllowance,
      }));
      setCalcInput((prev) => ({ ...prev, cashManwon: 5800 }));
      showToast("경력직 이직 트랙으로 전환되었습니다.");
    }
  };

  const handleOccupationChange = (nextOcc: CareerPassport["occupation"]) => {
    setPassport((prev) => {
      const preset = DEFAULT_ROLE_PRESETS[nextOcc];
      const isUsingPreviousPreset = Object.values(DEFAULT_ROLE_PRESETS).some(
        (p) => p.canonicalRole === prev.canonicalRole
      );
      return {
        ...prev,
        occupation: nextOcc,
        ...(preset && (isUsingPreviousPreset || !prev.canonicalRole.trim())
          ? { canonicalRole: preset.canonicalRole, skills: preset.skills }
          : {}),
      };
    });
  };

  const executePassportSearch = () => {
    handleSavePassport();
    setActiveTab("radar");
    showToast("입력 조건 기준으로 맞춤 공고 탐색을 실행했습니다.");
  };

  const addSkillChip = () => {
    const sk = newSkillInput.trim();
    if (!sk) return;
    if (!passport.skills.includes(sk)) {
      setPassport((prev) => ({ ...prev, skills: [...prev.skills, sk] }));
    }
    setNewSkillInput("");
  };

  const addCustomHardFilter = () => {
    const kw = customKeywordInput.trim();
    if (!kw) return;
    if (passport.hardFilters.customKeywords.includes(kw)) {
      showToast(`'${kw}' 키워드는 이미 등록되어 있습니다.`);
      return;
    }
    setPassport((prev) => ({
      ...prev,
      hardFilters: {
        ...prev.hardFilters,
        customKeywords: [...prev.hardFilters.customKeywords, kw],
      },
    }));
    setCustomKeywordInput("");
    showToast(`배제 키워드 '${kw}' 추가됨`);
  };

  const removeCustomHardFilter = (kw: string) => {
    setPassport((prev) => ({
      ...prev,
      hardFilters: {
        ...prev.hardFilters,
        customKeywords: prev.hardFilters.customKeywords.filter((k) => k !== kw),
      },
    }));
  };

  const resetHardFilters = () => {
    setPassport((prev) => ({
      ...prev,
      hardFilters: {
        onlyPermanent: true,
        onlyCapitalArea: true,
        maxCommuteCutoff: true,
        noHeavyFixedOT: false,
        noBelowCurrentSalary: false,
        noRelocationOrg: true,
        customKeywords: ["교대근무", "파견직", "일용직"],
      },
    }));
    showToast("절대 배제 기준이 기본값으로 복원되었습니다.");
  };

  const openJobDetail = (
    job: JobPosting,
    match: DynamicMatchScore,
    hf: { isExcluded: boolean; exclusionReasons: string[] }
  ) => {
    setSelectedJob(job);
    setSelectedJobMatch(match);
    setSelectedJobHf(hf);
  };

  const sendJobToScanner = (job: JobPosting) => {
    const textToScan =
      job.rawText || `${job.company} - ${job.title}\n급여: ${job.salaryDisplay}\n${job.tags.join(", ")}`;
    setScannerText(textToScan);
    setScanResult(diagnoseJobRisks(textToScan));
    setSelectedJob(null);
    setSelectedJobHf(null);
    setActiveTab("scanner");
    showToast(`${job.company} 공고를 근로계약 진단으로 전송했습니다.`);
  };

  // Market value & skill gap tracks
  const marketValue = calculateEstimatedMarketValue(
    `${passport.canonicalRole} ${passport.occupation}`,
    passport.totalYears,
    passport.track,
    mapCompanyTypeToTier(passport.companyType)
  );
  const skillGapTracks = calculateSkillGapTracks(passport);
  const totalSkillGapExpanded = skillGapTracks.reduce((sum, t) => sum + t.expandedCount, 0);

  // Matching & Hard Filter Pipeline
  const jobsWithScores = jobsDatabase.map((job) => ({
    job,
    match: calculateDynamicJobMatch(passport, job),
    hf: evaluateHardFilters(passport, job),
  }));

  const excludedCount = jobsWithScores.filter(({ hf }) => hf.isExcluded).length;

  const filteredJobs = jobsWithScores
    .filter(({ job, match, hf }) => {
      if (!showExcludedJobs && hf.isExcluded) return false;

      if (radarSearch.trim()) {
        const q = radarSearch.toLowerCase();
        const matchText =
          `${job.title} ${job.company} ${job.canonicalRole} ${job.industry} ${job.location} ${job.sourceSystem || ""} ${job.tags.join(" ")}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      if (radarFilter === "entry") {
        return (
          job.minYears === 0 ||
          job.isEntryLevel ||
          job.tags.some((t) => t.includes("신입") || t.includes("인턴")) ||
          job.title.includes("인턴") ||
          job.title.includes("신입")
        );
      }
      if (radarFilter === "tech") return job.occupation === "TECH";
      if (radarFilter === "finance") return job.occupation === "FINANCE";
      if (radarFilter === "marketing") return job.occupation === "MARKETING";
      if (radarFilter === "hr") return job.occupation === "HR";
      if (radarFilter === "planning") return job.occupation === "PLANNING";
      if (radarFilter === "exclusive") return job.isCompanyExclusive === true;
      if (radarFilter === "consulting") return job.sourceCategory === "CONSULTING";
      if (radarFilter === "public") return job.sourceCategory === "PUBLIC";
      if (radarFilter === "conglomerate") return job.sourceCategory === "CONGLOMERATE";
      if (radarFilter === "globalTech") return job.sourceCategory === "GLOBAL_TECH";
      if (radarFilter === "tierA") return job.salaryTier === "A";
      if (radarFilter === "highMatch") return match.totalScore >= 85;
      if (radarFilter === "commuteFit") return job.commuteMinutes <= (passport.commuteToleranceMinutes || 60);
      if (radarFilter === "nonOT") return !job.hasFixedOT;
      return true;
    })
    .sort((a, b) => b.match.totalScore - a.match.totalScore || a.job.commuteMinutes - b.job.commuteMinutes);

  const highMatchCount = jobsWithScores.filter(
    ({ match, hf }) => match.totalScore >= 88 && (!hf.isExcluded || showExcludedJobs)
  ).length;

  const ledgerData: SalaryBenchmark[] = [
    { id: "1", org: "한국수출입은행", role: "[FINANCE] 대졸 신입행원", tier: "A", salary: "5,200 ~ 5,800만 원", note: "기획재정부 ALIO 국책은행 신입 초임 공시", date: "2026 (ALIO)" },
    { id: "2", org: "신용보증기금", role: "[HR/기획] 일반직 정규직", tier: "A", salary: "5,000 ~ 6,200만 원", note: "금융공기업 경영지원·인사 ALIO 공시", date: "2026 (ALIO)" },
    { id: "3", org: "한국전력공사", role: "[PLANNING] 대졸 사무·기획 신입", tier: "A", salary: "4,350만 원", note: "기본급 + 고정수당 합산(ALIO 공시 기준)", date: "2026 (ALIO)" },
    { id: "4", org: "네이버클라우드", role: "[TECH] Cloud SW 신입 공채", tier: "A", salary: "5,000 ~ 6,000만 원", note: "대졸 신입 초임(성과급·주식 보상 별도)", date: "2026 (채용공고)" },
    { id: "5", org: "토스 (비바리퍼블리카)", role: "[TECH] Frontend Platform (신입/주니어)", tier: "A", salary: "5,500 ~ 7,000만 원", note: "확정 연봉 + 사이닝/스톡옵션 협의", date: "2026 (채용공고)" },
    { id: "6", org: "우아한형제들", role: "[TECH] 커머스 서버 개발 (3년+)", tier: "B", salary: "6,800 ~ 9,200만 원", note: "주 32/36시간제 + 비포괄 기준 오퍼 통계", date: "2026 (통계)" },
    { id: "7", org: "삼성전자 DX부문", role: "[HR] 인사기획 & People Analytics (5년+)", tier: "A", salary: "8,500 ~ 11,000만 원", note: "확정 연봉 기준 (OPI/TAI 성과급 별도)", date: "2026 (채용추정)" },
    { id: "8", org: "SK하이닉스", role: "[HR] People Operations 대졸 신입", tier: "A", salary: "5,300 ~ 6,200만 원", note: "대졸 초임 계약 연봉 + PS 성과급 별도", date: "2026 (채용추정)" },
    { id: "9", org: "신한은행", role: "[FINANCE] 기업금융/ICT 신입", tier: "A", salary: "5,400 ~ 6,200만 원", note: "시중은행 신입 행원 기본 보수 기준", date: "2026 (은행공시)" },
    { id: "10", org: "당근 (당근마켓)", role: "[MARKETING] 그로스 마케터 (3년+)", tier: "B", salary: "6,000 ~ 8,000만 원", note: "유니콘 플랫폼 경력직 오퍼 벤치마크", date: "2026 (채용공고)" },
    { id: "11", org: "현대자동차", role: "[PLANNING] 경영전략/사업기획 신입", tier: "A", salary: "4,800 ~ 5,500만 원", note: "완성차 대졸 초임 기준(성과금 별도)", date: "2026 (사업보고서)" },
    { id: "12", org: "삼일PwC / 삼정KPMG / 딜로이트", role: "[FINANCE/컨설팅] 신입 CPA·자문", tier: "B", salary: "4,600 ~ 5,600만 원", note: "Big4 회계법인 스태프 1년차 기본 처우", date: "2026 (법인기준)" },
  ];

  const filteredLedger = ledgerData.filter(
    (item) =>
      item.org.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.role.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.tier.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.note.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  const calcResult = calculateLifeAdjustedHourlyWage(calcInput);
  const dropPct =
    calcResult.nominalHourlyWage > 0
      ? (((calcResult.nominalHourlyWage - calcResult.realHourlyWage) / calcResult.nominalHourlyWage) * 100).toFixed(1)
      : "0.0";
  const wageTierBadge =
    calcResult.realHourlyWage >= 32000
      ? "최상위 효용 구간"
      : calcResult.realHourlyWage >= 22000
      ? "양호한 실질 효용"
      : calcResult.realHourlyWage >= 14000
      ? "통근·야근 누수 주의"
      : "시간 대비 저보상 구간";

  const currentAnnualCash = passport.baseSalary + passport.fixedAllowance || calcInput.cashManwon;
  const currentCalc = calculateLifeAdjustedHourlyWage({
    cashManwon: currentAnnualCash,
    commuteMinutesOneway: calcInput.commuteMinutesOneway,
    monthlyTransitCostManwon: calcInput.monthlyTransitCostManwon,
    weeklyRemoteDays: calcInput.weeklyRemoteDays,
    weeklyWorkHours: calcInput.weeklyWorkHours,
  });
  const offerACalc = calculateLifeAdjustedHourlyWage({
    cashManwon: offerA.baseManwon + offerA.allowanceManwon,
    commuteMinutesOneway: offerA.commuteMinutesOneway,
    monthlyTransitCostManwon: calcInput.monthlyTransitCostManwon,
    weeklyRemoteDays: offerA.weeklyRemoteDays,
    weeklyWorkHours: offerA.weeklyWorkHours,
  });
  const offerBCalc = calculateLifeAdjustedHourlyWage({
    cashManwon: offerB.baseManwon + offerB.allowanceManwon,
    commuteMinutesOneway: offerB.commuteMinutesOneway,
    monthlyTransitCostManwon: calcInput.monthlyTransitCostManwon,
    weeklyRemoteDays: offerB.weeklyRemoteDays,
    weeklyWorkHours: offerB.weeklyWorkHours,
  });

  const bestOfferName =
    offerBCalc.realHourlyWage >= offerACalc.realHourlyWage &&
    offerBCalc.realHourlyWage >= currentCalc.realHourlyWage
      ? offerB.label
      : offerACalc.realHourlyWage >= currentCalc.realHourlyWage
      ? offerA.label
      : "현재 직장";

  const copySafe = (text: string, okMsg: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(okMsg))
        .catch(() => showToast("클립보드 접근이 제한되었습니다."));
    } else {
      showToast("브라우저에서 자동 복사를 지원하지 않습니다.");
    }
  };

  const copyCalculatorText = () => {
    const text = `[Career Radar — 실질 체감 시급]
• 확정 현금: ${calcInput.cashManwon.toLocaleString()}만 원 (명목 ${calcResult.nominalHourlyWage.toLocaleString()}원)
• 편도 통근: ${calcInput.commuteMinutesOneway}분 | 주 ${calcInput.weeklyWorkHours}h | 재택 주 ${calcInput.weeklyRemoteDays}일
• 실질 시급: ${calcResult.realHourlyWage.toLocaleString()}원 (-${dropPct}%)`;
    copySafe(text, "실질 시급 요약이 복사되었습니다.");
  };

  const copyOfferText = () => {
    const text = `[Career Radar — 오퍼 비교]
• 현재 직장: ${currentAnnualCash.toLocaleString()}만 | ${currentCalc.realHourlyWage.toLocaleString()}원/h
• ${offerA.label}: ${(offerA.baseManwon + offerA.allowanceManwon).toLocaleString()}만 | ${offerACalc.realHourlyWage.toLocaleString()}원/h
• ${offerB.label}: ${(offerB.baseManwon + offerB.allowanceManwon).toLocaleString()}만 | ${offerBCalc.realHourlyWage.toLocaleString()}원/h
→ 최적안: ${bestOfferName}`;
    copySafe(text, "오퍼 비교 요약이 복사되었습니다.");
  };

  const handleScan = () => {
    if (!scannerText.trim()) {
      showToast("검사할 공고 본문이나 계약서 문구를 입력해 주세요.");
      return;
    }
    setScanResult(diagnoseJobRisks(scannerText));
    showToast("근로계약 위험 진단이 완료되었습니다.");
  };

  const navTabs: { id: TabId; label: string }[] = [
    { id: "passport", label: "1. 조건 설정" },
    { id: "radar", label: "2. 공고 레이더" },
    { id: "scanner", label: "3. 계약 진단" },
    { id: "calculator", label: "4. 실질 시급" },
    { id: "matrix", label: "5. 오퍼 비교" },
    { id: "ledger", label: "6. 연봉 원장" },
  ];

  const renderNavButtons = () =>
    navTabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => setActiveTab(tab.id)}
        className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
          activeTab === tab.id
            ? "bg-[#222226] text-[#FAFAFA] border border-white/[0.12]"
            : "text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B]"
        }`}
      >
        {tab.label}
      </button>
    ));

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#FAFAFA] flex flex-col font-sans">
      {/* Monochrome Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#18181B] border border-white/[0.16] text-zinc-100 px-4 py-2.5 rounded-[8px] flex items-center space-x-3 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150"
          >
            <IconClose className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Compact Header Shell (48px Desktop Single-Line + Mobile Sub-Bar) */}
      <header className="sticky top-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-6 h-6 rounded-[6px] bg-[#FAFAFA] text-[#0A0A0B] flex items-center justify-center font-mono font-bold text-[11px]">
              CR
            </div>
            <span className="font-semibold text-sm tracking-[-0.02em] text-zinc-100">Career Radar</span>
            <span className="hidden sm:inline text-zinc-700">/</span>
            <span className="hidden sm:inline font-mono text-[11px] text-zinc-500 tabular-nums">
              {jobsDatabase.length} jobs
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-1 overflow-x-auto">
            {renderNavButtons()}
          </nav>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsResumeModalOpen(true)}
              className="px-2.5 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors duration-150 whitespace-nowrap"
            >
              이력서 파싱
            </button>
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] bg-[#111113] hover:bg-[#18181B] border border-white/[0.08] text-xs text-zinc-400 hover:text-zinc-200 transition-colors duration-150"
              title="빠른 명령 (Ctrl+K / ⌘K)"
            >
              <IconCommand className="w-3 h-3" />
              <span className="font-mono text-[11px]">K</span>
            </button>
          </div>
        </div>

        {/* Mobile Scrollable Tab Navigation */}
        <nav className="md:hidden border-t border-white/[0.08] px-3 py-1.5 flex items-center space-x-1 overflow-x-auto">
          {renderNavButtons()}
        </nav>
      </header>

      {/* Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Top 4-Cell KPI Summary Strip (Mobbin / Linear Analytics Style) */}
        <section
          aria-label="핵심 커리어 요약 지표"
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.08] border border-white/[0.08] rounded-[10px] overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setIsMarketValueModalOpen(true)}
            className="bg-[#111113] p-3.5 sm:p-4 text-left hover:bg-[#18181B] transition-colors duration-150 group min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
              <span className="truncate">추정 시장가치 (P25–P75)</span>
              <span className="font-mono text-zinc-500 group-hover:text-zinc-300 shrink-0">공식 ↗</span>
            </div>
            <div className="mt-1.5 text-[14px] sm:text-lg font-semibold font-mono tabular-nums tracking-[-0.02em] text-zinc-100 leading-snug break-keep">
              {marketValue.rangeDisplay}
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 truncate">
              {marketValue.tierDesc} · {passport.totalYears === 0 ? "신입" : `${passport.totalYears}년차`}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("radar")}
            className="bg-[#111113] p-3.5 sm:p-4 text-left hover:bg-[#18181B] transition-colors duration-150 group min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
              <span className="truncate">고적합 공고 (88%+)</span>
              <span className="font-mono text-zinc-500 group-hover:text-zinc-300 shrink-0">레이더 →</span>
            </div>
            <div className="mt-1.5 text-base sm:text-lg font-semibold font-mono tabular-nums tracking-[-0.02em] text-zinc-100 flex items-center space-x-2">
              <span>{highMatchCount}건</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 font-mono tabular-nums truncate">
              필터 통과 {filteredJobs.length} / 전체 {jobsDatabase.length}건
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsSkillGapModalOpen(true)}
            className="bg-[#111113] p-3.5 sm:p-4 text-left hover:bg-[#18181B] transition-colors duration-150 group min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
              <span className="truncate">스킬 갭 보완 시 확장</span>
              <span className="font-mono text-zinc-500 group-hover:text-zinc-300 shrink-0">로드맵 ↗</span>
            </div>
            <div className="mt-1.5 text-base sm:text-lg font-semibold font-mono tabular-nums tracking-[-0.02em] text-zinc-100">
              +{totalSkillGapExpanded}건
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 truncate">
              {skillGapTracks[0].name.split("&")[0].trim()} 외 {skillGapTracks.length - 1}트랙
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsCrawlerModalOpen(true)}
            className="bg-[#111113] p-3.5 sm:p-4 text-left hover:bg-[#18181B] transition-colors duration-150 group min-w-0"
          >
            <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
              <span className="truncate">ATS 수집 네트워크</span>
              <span className="font-mono text-zinc-500 group-hover:text-zinc-300 shrink-0">채널 ↗</span>
            </div>
            <div className="mt-1.5 text-base sm:text-lg font-semibold font-mono tabular-nums tracking-[-0.02em] text-zinc-100">
              {CRAWLER_SOURCES.length}채널
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500 truncate">
              실시간 3 + 공식 채용관 {CRAWLER_SOURCES.length - 3}
            </div>
          </button>
        </section>

        {/* TAB 1: CAREER PASSPORT */}
        {activeTab === "passport" && (
          <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] divide-y divide-white/[0.08]">
            {/* Action Header */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">
                  1. 내 커리어 조건 설정
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  직무·경력·기업 Tier·배제 조건을 설정하면 모든 공고의 적합도와 시장 연봉이 즉시 재산출됩니다.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors duration-150"
                >
                  이력서 파싱
                </button>
                <button
                  type="button"
                  onClick={handleSavePassport}
                  className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors duration-150"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={executePassportSearch}
                  className="px-3.5 py-1.5 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150 inline-flex items-center space-x-1"
                >
                  <span>맞춤 공고 탐색 실행</span>
                  <IconChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3-Column Core Inputs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
              {/* Col 1: Role & Years */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">01 · 직무 및 경력</h2>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {passport.track === "ENTRY" || passport.totalYears === 0 ? "ENTRY" : "EXPERIENCED"}
                  </span>
                </div>

                <div className="grid grid-cols-2 p-0.5 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px]">
                  <button
                    type="button"
                    onClick={() => setTrackPreset("ENTRY")}
                    className={`py-1.5 rounded-[4px] text-xs font-medium transition-colors duration-150 ${
                      passport.track === "ENTRY" || passport.totalYears === 0
                        ? "bg-[#222226] text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    신입/인턴 (0년차)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackPreset("EXPERIENCED")}
                    className={`py-1.5 rounded-[4px] text-xs font-medium transition-colors duration-150 ${
                      passport.track !== "ENTRY" && passport.totalYears > 0
                        ? "bg-[#222226] text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    경력직 이직
                  </button>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">직군 분야</label>
                  <select
                    value={passport.occupation}
                    onChange={(e) => handleOccupationChange(e.target.value as CareerPassport["occupation"])}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25]"
                  >
                    <option value="HR">인사 / HR / 피플앤컬처</option>
                    <option value="PLANNING">전략 / 기획 / 컨설팅 / PM</option>
                    <option value="TECH">IT / 소프트웨어 개발 / 데이터·AI</option>
                    <option value="MARKETING">마케팅 / 그로스 / 브랜딩</option>
                    <option value="FINANCE">재무 / 회계 / 투자 / 금융</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">세부 직무명 및 키워드</label>
                  <input
                    type="text"
                    value={passport.canonicalRole}
                    onChange={(e) => setPassport({ ...passport, canonicalRole: e.target.value })}
                    placeholder="예: React 프론트엔드, KICPA 회계사, 그로스마케팅"
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {passport.skills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#18181B] border border-white/[0.08] text-zinc-300 text-[11px]"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPassport((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((s) => s !== sk),
                            }))
                          }
                          className="ml-1.5 text-zinc-500 hover:text-zinc-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-1.5 mt-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkillChip();
                        }
                      }}
                      placeholder="보유 스킬 추가 후 Enter..."
                      className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-[11px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                    />
                    <button
                      type="button"
                      onClick={addSkillChip}
                      className="px-2.5 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-[11px] text-zinc-300"
                    >
                      추가
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <label className="text-zinc-300 font-medium">경력 연차</label>
                    <span className="font-mono tabular-nums font-semibold text-zinc-100">
                      {passport.totalYears === 0 ? "0년 (신입)" : `${passport.totalYears}년차`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={passport.totalYears}
                    onChange={(e) => {
                      const yrs = parseInt(e.target.value, 10) || 0;
                      setPassport({
                        ...passport,
                        totalYears: yrs,
                        track: yrs === 0 ? "ENTRY" : "EXPERIENCED",
                      });
                    }}
                    className="w-full mono-range"
                  />
                </div>
              </div>

              {/* Col 2: Tier & Compensation */}
              <div className="p-5 space-y-4">
                <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  02 · 목표 기업군 및 현재 보상
                </h2>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">목표/현재 기업 유형</label>
                  <select
                    value={passport.companyType}
                    onChange={(e) => setPassport({ ...passport, companyType: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25]"
                  >
                    <option value="빅테크/유니콘">Tier 1 · 빅테크 / 유니콘 (1.40x)</option>
                    <option value="대기업">Tier 2 · 주요 대기업 계열사 (1.25x)</option>
                    <option value="금융/공공기관">Tier 3 · 금융권 / 공공기관 (1.15x)</option>
                    <option value="중견기업">표준 · 일반 중견 / 전문법인 (1.00x)</option>
                    <option value="스타트업/중소기업">Tier 4 · 스타트업 / 중소 (0.90x)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">기본급 (만 원/년)</label>
                    <input
                      type="number"
                      min="0"
                      value={passport.baseSalary}
                      onChange={(e) =>
                        setPassport({ ...passport, baseSalary: Math.max(0, parseInt(e.target.value, 10) || 0) })
                      }
                      className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-white/[0.25]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">고정수당 (만 원/년)</label>
                    <input
                      type="number"
                      min="0"
                      value={passport.fixedAllowance}
                      onChange={(e) =>
                        setPassport({ ...passport, fixedAllowance: Math.max(0, parseInt(e.target.value, 10) || 0) })
                      }
                      className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-white/[0.25]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-[8px] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">확정 연간 현금 합계</span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-100">
                    {(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만 원
                  </span>
                </div>
              </div>

              {/* Col 3: Location & Commute */}
              <div className="p-5 space-y-4">
                <h2 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">03 · 근무지 및 통근 한도</h2>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">거주지</label>
                  <input
                    type="text"
                    value={passport.homeLocation}
                    onChange={(e) => setPassport({ ...passport, homeLocation: e.target.value })}
                    className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/[0.25]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <label className="text-zinc-300 font-medium">최대 허용 편도 통근</label>
                    <span className="font-mono tabular-nums font-semibold text-zinc-100">
                      {passport.commuteToleranceMinutes}분 이내
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={passport.commuteToleranceMinutes}
                    onChange={(e) =>
                      setPassport({ ...passport, commuteToleranceMinutes: parseInt(e.target.value, 10) || 60 })
                    }
                    className="w-full mono-range"
                  />
                </div>

                <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-[8px] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">필터 적용 후 추천 풀</span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-100">
                    {filteredJobs.length} / {jobsDatabase.length}건
                  </span>
                </div>
              </div>
            </div>

            {/* Hard Filter Panel */}
            <div className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-xs font-semibold text-zinc-200">절대 배제 조건 (Hard Filter)</h2>
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#18181B] border border-white/[0.08] font-mono tabular-nums text-[10px] text-zinc-400">
                    {excludedCount}건 제외 중
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetHardFilters}
                  className="text-xs text-zinc-400 hover:text-zinc-100 underline decoration-zinc-700 transition-colors duration-150 self-start sm:self-auto"
                >
                  기본값 복원
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                {[
                  {
                    key: "onlyPermanent" as const,
                    title: "정규직만 허용",
                    sub: "계약·파견·위촉직 배제",
                    checked: passport.hardFilters.onlyPermanent,
                  },
                  {
                    key: "onlyCapitalArea" as const,
                    title: "수도권·원격만 허용",
                    sub: "지방 근무지 배제",
                    checked: passport.hardFilters.onlyCapitalArea,
                  },
                  {
                    key: "maxCommuteCutoff" as const,
                    title: "통근 한도 초과 컷",
                    sub: `${passport.commuteToleranceMinutes}분 초과 배제`,
                    checked: passport.hardFilters.maxCommuteCutoff,
                  },
                  {
                    key: "noHeavyFixedOT" as const,
                    title: "고정OT 20h 초과 배제",
                    sub: "과도한 포괄임금 컷",
                    checked: passport.hardFilters.noHeavyFixedOT,
                  },
                  {
                    key: "noBelowCurrentSalary" as const,
                    title: "현재 보상 미만 배제",
                    sub: `${(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만 미만 컷`,
                    checked: passport.hardFilters.noBelowCurrentSalary,
                  },
                  {
                    key: "noRelocationOrg" as const,
                    title: "지방 이전·순환 기관 배제",
                    sub: "혁신도시 순환근무 컷",
                    checked: passport.hardFilters.noRelocationOrg,
                  },
                ].map((f) => (
                  <label
                    key={f.key}
                    className={`flex items-start space-x-2.5 p-3 rounded-[8px] border cursor-pointer transition-colors duration-150 select-none ${
                      f.checked
                        ? "bg-[#18181B] border-white/[0.14]"
                        : "bg-[#0A0A0B] border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={f.checked}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, [f.key]: e.target.checked },
                        })
                      }
                      className="mt-0.5 w-3.5 h-3.5 rounded accent-zinc-100 bg-zinc-900 border-zinc-700"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-200">{f.title}</div>
                      <div className="text-[11px] text-zinc-500">{f.sub}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customKeywordInput}
                    onChange={(e) => setCustomKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomHardFilter();
                      }
                    }}
                    placeholder="직접 배제 키워드 입력 (예: 교대근무, 야간당직) 후 Enter..."
                    className="flex-1 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                  />
                  <button
                    type="button"
                    onClick={addCustomHardFilter}
                    className="px-3.5 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-colors duration-150"
                  >
                    키워드 추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {passport.hardFilters.customKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[4px] bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px]"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomHardFilter(kw)}
                        className="text-rose-400 hover:text-white font-mono"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OPPORTUNITY RADAR */}
        {activeTab === "radar" && (
          <div className="space-y-4">
            {/* Search & Filter Controller */}
            <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] p-4 space-y-3.5">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">2. 맞춤 공고 탐색</h1>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#18181B] border border-white/[0.08] font-mono tabular-nums text-[11px] text-zinc-300">
                      {filteredJobs.length}건 추천됨
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {passport.occupation} · {passport.totalYears === 0 ? "신입" : `${passport.totalYears}년차`} · 통근{" "}
                    {passport.commuteToleranceMinutes}분 이내 기준 적합도 내림차순
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <IconSearch className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="기업명, 공고, 직무 검색..."
                      value={radarSearch}
                      onChange={(e) => setRadarSearch(e.target.value)}
                      className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                    />
                  </div>
                  {(radarFilter !== "all" || radarSearch.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setRadarFilter("all");
                        setRadarSearch("");
                      }}
                      className="px-2.5 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-300 shrink-0"
                    >
                      초기화
                    </button>
                  )}
                  <div className="flex p-0.5 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] shrink-0">
                    <button
                      type="button"
                      onClick={() => setRadarViewMode("table")}
                      className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors duration-150 ${
                        radarViewMode === "table" ? "bg-[#222226] text-zinc-100" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      테이블
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadarViewMode("cards")}
                      className={`px-2 py-1 rounded-[4px] text-[11px] font-medium transition-colors duration-150 ${
                        radarViewMode === "cards" ? "bg-[#222226] text-zinc-100" : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      카드
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/[0.06] text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 w-14">직군</span>
                  {(
                    [
                      { id: "all", label: "전체" },
                      { id: "tech", label: "IT·개발" },
                      { id: "finance", label: "금융·재무·회계" },
                      { id: "marketing", label: "마케팅·그로스" },
                      { id: "hr", label: "인사·HR" },
                      { id: "planning", label: "전략·기획·PM" },
                    ] as { id: RadarFilterId; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRadarFilter(f.id)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs transition-colors duration-150 ${
                        radarFilter === f.id
                          ? "bg-[#FAFAFA] text-[#0A0A0B] font-semibold"
                          : "bg-[#18181B] text-zinc-300 hover:bg-[#222226] border border-white/[0.06]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-zinc-500 w-14">기업·조건</span>
                  {(
                    [
                      { id: "exclusive", label: "자사 단독" },
                      { id: "conglomerate", label: "대기업" },
                      { id: "public", label: "공공기관(ALIO)" },
                      { id: "consulting", label: "Big4·컨설팅" },
                      { id: "globalTech", label: "글로벌·유니콘" },
                      { id: "entry", label: "신입·인턴" },
                      { id: "highMatch", label: "적합도 85%+" },
                      { id: "commuteFit", label: `통근 ${passport.commuteToleranceMinutes}분↓` },
                      { id: "nonOT", label: "비포괄" },
                    ] as { id: RadarFilterId; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRadarFilter(f.id)}
                      className={`px-2.5 py-1 rounded-[6px] text-xs transition-colors duration-150 ${
                        radarFilter === f.id
                          ? "bg-[#FAFAFA] text-[#0A0A0B] font-semibold"
                          : "bg-[#18181B] text-zinc-300 hover:bg-[#222226] border border-white/[0.06]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-white/[0.06] text-xs text-zinc-400">
                <span>
                  절대 배제 조건으로 <span className="font-mono tabular-nums text-zinc-200">{excludedCount}건</span>이 제외되었습니다.
                </span>
                <label className="flex items-center space-x-2 text-zinc-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showExcludedJobs}
                    onChange={(e) => setShowExcludedJobs(e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-zinc-100"
                  />
                  <span>배제된 공고도 함께 보기</span>
                </label>
              </div>
            </div>

            {/* Results: Table or Cards */}
            {filteredJobs.length === 0 ? (
              <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] py-16 text-center text-xs text-zinc-400">
                조건에 일치하는 공고가 없습니다. 필터를 초기화하거나 배제 기준을 완화해 주세요.
              </div>
            ) : radarViewMode === "table" ? (
              <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
                    <tr>
                      <th className="py-2.5 px-3.5 font-medium">기업 / 포지션</th>
                      <th className="py-2.5 px-3 font-medium">직군</th>
                      <th className="py-2.5 px-3 font-medium">보상 기준</th>
                      <th className="py-2.5 px-3 font-medium">통근</th>
                      <th className="py-2.5 px-3 font-medium">임금형태</th>
                      <th className="py-2.5 px-3 text-right font-medium">적합도</th>
                      <th className="py-2.5 px-3.5 text-right font-medium">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredJobs.map(({ job, match, hf }) => (
                      <tr
                        key={job.id}
                        onClick={() => openJobDetail(job, match, hf)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          hf.isExcluded ? "opacity-55 hover:bg-[#18181B]" : "hover:bg-[#18181B]"
                        }`}
                      >
                        <td className="py-3 px-3.5 max-w-md">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-zinc-100 shrink-0">{job.company}</span>
                            {job.isEntryLevel && (
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#18181B] border border-white/[0.08] text-[10px] text-zinc-300 shrink-0">
                                신입
                              </span>
                            )}
                            {hf.isExcluded && (
                              <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 shrink-0">
                                배제
                              </span>
                            )}
                          </div>
                          <div className="text-zinc-300 mt-0.5 truncate">{job.title}</div>
                          {hf.isExcluded && (
                            <div className="text-[11px] text-rose-400 mt-0.5 truncate">{hf.exclusionReasons[0]}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">{job.occupation}</td>
                        <td className="py-3 px-3 font-mono tabular-nums text-zinc-200 whitespace-nowrap">
                          {job.salaryMinManwon.toLocaleString()}~{job.salaryMaxManwon.toLocaleString()}만
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-zinc-300 whitespace-nowrap">
                          {job.commuteMinutes}분
                        </td>
                        <td className="py-3 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                          {job.hasFixedOT ? `포괄 ${job.fixedOTHours}h` : "비포괄"}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1.5 font-mono tabular-nums font-semibold">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                match.totalScore >= 88
                                  ? "bg-emerald-400"
                                  : match.totalScore >= 70
                                  ? "bg-zinc-300"
                                  : "bg-zinc-600"
                              }`}
                            />
                            <span className={match.totalScore >= 88 ? "text-emerald-400" : "text-zinc-100"}>
                              {match.totalScore}%
                            </span>
                          </span>
                        </td>
                        <td
                          className="py-3 px-3.5 text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => openJobDetail(job, match, hf)}
                              className="px-2 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-[11px] text-zinc-200"
                            >
                              상세 분석
                            </button>
                            <button
                              type="button"
                              onClick={() => sendJobToScanner(job)}
                              className="px-2 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-[11px] text-zinc-300"
                            >
                              진단
                            </button>
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-[#0A0A0B] text-[11px] font-semibold inline-flex items-center space-x-0.5"
                            >
                              <span>원문</span>
                              <IconExternal className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredJobs.map(({ job, match, hf }) => (
                  <div
                    key={job.id}
                    className={`bg-[#111113] border ${
                      hf.isExcluded ? "border-rose-500/20 opacity-60" : "border-white/[0.08] hover:border-white/[0.16]"
                    } rounded-[10px] p-4 space-y-3.5 flex flex-col justify-between transition-colors duration-150`}
                  >
                    <div>
                      {hf.isExcluded && (
                        <div className="mb-3 px-2.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-[6px] text-rose-300 text-[11px]">
                          배제 사유: {hf.exclusionReasons.join(" · ")}
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                            <span className="font-semibold text-zinc-200">{job.company}</span>
                            <span>·</span>
                            <span className="font-mono">{job.occupation}</span>
                            {job.isEntryLevel && (
                              <>
                                <span>·</span>
                                <span className="text-zinc-300">신입/인턴</span>
                              </>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-100 mt-1">{job.title}</h3>
                          <p className="text-xs text-zinc-400 mt-0.5">{job.canonicalRole}</p>
                        </div>

                        <div className="text-right shrink-0 bg-[#18181B] border border-white/[0.08] px-2.5 py-1.5 rounded-[6px]">
                          <span
                            className={`text-lg font-mono tabular-nums font-bold block leading-none ${
                              match.totalScore >= 88 ? "text-emerald-400" : "text-zinc-100"
                            }`}
                          >
                            {match.totalScore}%
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">FIT</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 my-3 text-center">
                        {[
                          { label: "직무", v: match.roleFit },
                          { label: "연차", v: match.seniorityFit },
                          { label: "통근", v: match.commuteFit },
                          { label: "보상", v: match.salaryFit },
                        ].map((m) => (
                          <div key={m.label} className="bg-[#0A0A0B] border border-white/[0.06] py-1.5 rounded-[6px]">
                            <span className="text-[10px] text-zinc-500 block">{m.label}</span>
                            <span className="font-mono tabular-nums text-xs text-zinc-200 font-medium">{m.v}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs bg-[#18181B] border border-white/[0.06] px-3 py-2 rounded-[6px]">
                        <span className="font-mono tabular-nums text-zinc-200">{job.salaryDisplay}</span>
                        <span className="font-mono tabular-nums text-zinc-400 shrink-0 ml-2">{job.commuteMinutes}분</span>
                      </div>

                      <div className="space-y-1 text-[11px] pt-2.5">
                        {match.matchedReasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="text-zinc-300 flex items-center space-x-1.5">
                            <span className="text-emerald-400 font-mono">+</span>
                            <span className="truncate">{reason}</span>
                          </div>
                        ))}
                        {match.gapReasons.slice(0, 1).map((gap, idx) => (
                          <div key={idx} className="text-zinc-500 flex items-center space-x-1.5">
                            <span className="text-amber-400 font-mono">-</span>
                            <span className="truncate">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {job.sourceSystem || job.sourceName} · {job.hasFixedOT ? `포괄 ${job.fixedOTHours}h` : "비포괄"}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openJobDetail(job, match, hf)}
                          className="px-2.5 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-200"
                        >
                          상세 분석
                        </button>
                        <button
                          type="button"
                          onClick={() => sendJobToScanner(job)}
                          className="px-2.5 py-1 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-300"
                        >
                          노동법 진단
                        </button>
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-[#0A0A0B] text-xs font-semibold inline-flex items-center space-x-1"
                        >
                          <span>지원 원문</span>
                          <IconExternal className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LABOR RISK SCANNER */}
        {activeTab === "scanner" && (
          <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] divide-y divide-white/[0.08]">
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">
                  3. 근로계약 · 공고 독소조항 진단
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  포괄임금 고정OT, 퇴직금 분할 지급, 수습 감액, 위약 예정 금지(근로기준법 제20조) 위반 소지를 검출합니다.
                </p>
              </div>
              <div className="flex space-x-2 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const ex =
                      "연봉 4,800만원(포괄임금 월 고정 OT 35시간 포함, 퇴직금 1/13 분할 지급). 수습 3개월 급여 80% 지급, 1년 이내 퇴사 시 교육비 반환 및 위약금 조항 적용.";
                    setScannerText(ex);
                    setScanResult(diagnoseJobRisks(ex));
                  }}
                  className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-rose-300"
                >
                  위험 계약 샘플 넣기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ex =
                      "정규직 연봉 6,000만원(비포괄임금제로 연장근로수당 별도 정산). 퇴직연금 DC형 가입, 수습기간 급여 100% 지급(감액 없음), 유연근무제 시행.";
                    setScannerText(ex);
                    setScanResult(diagnoseJobRisks(ex));
                  }}
                  className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-emerald-300"
                >
                  정상 계약 샘플 넣기
                </button>
              </div>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-3">
                <textarea
                  rows={12}
                  value={scannerText}
                  onChange={(e) => setScannerText(e.target.value)}
                  placeholder="채용 공고 본문이나 근로계약 조건을 붙여넣으세요..."
                  className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] p-3.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                />
                <button
                  type="button"
                  onClick={handleScan}
                  className="w-full py-2.5 rounded-[6px] bg-[#FAFAFA] hover:bg-white font-semibold text-xs text-[#0A0A0B] transition-colors duration-150"
                >
                  계약 리스크 진단 실행
                </button>
              </div>

              <div className="bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] p-4">
                {scanResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-white/[0.08] pb-2.5">
                      <span className={`text-xs font-semibold ${scanResult.isClean ? "text-emerald-400" : "text-rose-400"}`}>
                        진단 결과 ({scanResult.warnings.length}건 위험 감지)
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono tabular-nums">
                        {scanResult.hasFixedOT ? `고정OT ${scanResult.fixedOTHours}h` : "고정OT 없음"}
                      </span>
                    </div>

                    {scanResult.warnings.map((w, idx) => (
                      <div key={idx} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-[6px] space-y-1">
                        <div className="text-xs font-semibold text-rose-400">{w.title}</div>
                        <div className="text-[11px] text-zinc-300 leading-relaxed">{w.desc}</div>
                      </div>
                    ))}

                    {scanResult.isClean && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-[6px] text-center">
                        <div className="text-emerald-400 text-xs font-semibold">깨끗하고 투명한 공고 조건입니다.</div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          포괄임금, 퇴직금 분할, 수습 감액 등 독소조항이 감지되지 않았습니다.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 py-20 text-xs">
                    왼쪽에 본문을 입력하거나 [2. 공고 레이더]에서 [진단] 버튼을 눌러 전송하세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIFE-ADJUSTED CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08] grid grid-cols-1 lg:grid-cols-2">
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
                <div>
                  <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">4. 실질 체감 시급 계산기</h1>
                  <p className="text-xs text-zinc-400 mt-0.5">왕복 통근 시간과 교통비까지 차감한 진짜 시간당 가치</p>
                </div>
                <button
                  type="button"
                  onClick={copyCalculatorText}
                  className="px-3 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-200 font-medium"
                >
                  결과 복사
                </button>
              </div>

              {[
                { label: "확정 연간 현금", unit: "만 원", val: calcInput.cashManwon, min: 2000, max: 15000, step: 100, key: "cashManwon" as const },
                { label: "편도 통근 시간", unit: "분", val: calcInput.commuteMinutesOneway, min: 10, max: 120, step: 5, key: "commuteMinutesOneway" as const },
                { label: "월 교통비/유류비", unit: "만 원", val: calcInput.monthlyTransitCostManwon, min: 0, max: 50, step: 1, key: "monthlyTransitCostManwon" as const },
                { label: "주당 실근로시간", unit: "시간", val: calcInput.weeklyWorkHours, min: 35, max: 68, step: 1, key: "weeklyWorkHours" as const },
                { label: "주당 재택근무 일수", unit: "일", val: calcInput.weeklyRemoteDays, min: 0, max: 5, step: 1, key: "weeklyRemoteDays" as const },
              ].map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <label className="text-zinc-300 font-medium">{s.label}</label>
                    <span className="font-mono tabular-nums font-semibold text-zinc-100">
                      {s.val.toLocaleString()}
                      {s.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={s.val}
                    onChange={(e) => setCalcInput({ ...calcInput, [s.key]: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mono-range"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 flex flex-col justify-center space-y-5 bg-[#0A0A0B]/40">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  실질 체감 시급 (Life-Adjusted)
                </span>
                <div className="text-4xl font-mono tabular-nums font-bold tracking-[-0.02em] text-zinc-50 mt-1">
                  {calcResult.realHourlyWage.toLocaleString()}원
                </div>
                <p className="text-xs text-zinc-400 mt-1.5 font-mono tabular-nums">
                  단순 명목 시급 {calcResult.nominalHourlyWage.toLocaleString()}원 · {dropPct}% 체감 하락
                </p>
              </div>

              <div className="grid grid-cols-2 bg-[#18181B] border border-white/[0.08] rounded-[8px] divide-x divide-white/[0.08] text-xs">
                <div className="p-3">
                  <span className="text-[11px] text-zinc-500 block">연간 통근 소모</span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-100 mt-0.5 block">
                    {calcResult.annualCommuteHours}h ({(calcResult.annualCommuteHours / 24).toFixed(1)}일)
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-zinc-500 block">효용 등급</span>
                  <span className="font-medium text-zinc-200 mt-0.5 block">{wageTierBadge}</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#18181B] border border-white/[0.08] rounded-[8px] text-xs text-zinc-300 leading-relaxed">
                {calcResult.utilityVerdictText}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFER MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] divide-y divide-white/[0.08]">
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">5. 이직처 다차원 비교표</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  현재 조건({currentAnnualCash.toLocaleString()}만 원)과 두 제안을 직접 수정해 실질 시급을 비교하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={copyOfferText}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#18181B] hover:bg-[#222226] border border-white/[0.08] text-xs text-zinc-200 font-medium"
              >
                비교 요약 복사
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">평가 항목</th>
                    <th className="py-2.5 px-4 font-medium">현재 직장</th>
                    <th className="py-2.5 px-4 font-medium text-zinc-200">{offerA.label}</th>
                    <th className="py-2.5 px-4 font-medium text-zinc-200">{offerB.label}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] font-mono tabular-nums">
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-zinc-300">확정 연봉 (만 원)</td>
                    <td className="px-4 text-zinc-200">{currentAnnualCash.toLocaleString()}만</td>
                    <td className="px-4">
                      <input
                        type="number"
                        value={offerA.baseManwon + offerA.allowanceManwon}
                        onChange={(e) => setOfferA({ baseManwon: Math.max(0, parseInt(e.target.value, 10) || 0), allowanceManwon: 0 })}
                        className="w-28 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="number"
                        value={offerB.baseManwon + offerB.allowanceManwon}
                        onChange={(e) => setOfferB({ baseManwon: Math.max(0, parseInt(e.target.value, 10) || 0), allowanceManwon: 0 })}
                        className="w-28 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-zinc-300">편도 통근 (분)</td>
                    <td className="px-4 text-zinc-200">{calcInput.commuteMinutesOneway}분</td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={offerA.commuteMinutesOneway}
                        onChange={(e) => setOfferA({ commuteMinutesOneway: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-24 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={offerB.commuteMinutesOneway}
                        onChange={(e) => setOfferB({ commuteMinutesOneway: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-24 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-zinc-300">주 재택근무 (일)</td>
                    <td className="px-4 text-zinc-200">주 {calcInput.weeklyRemoteDays}일</td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={offerA.weeklyRemoteDays}
                        onChange={(e) => setOfferA({ weeklyRemoteDays: Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                        className="w-20 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={offerB.weeklyRemoteDays}
                        onChange={(e) => setOfferB({ weeklyRemoteDays: Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                        className="w-20 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-zinc-300">주 실근로 (시간)</td>
                    <td className="px-4 text-zinc-200">{calcInput.weeklyWorkHours}h</td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="30"
                        max="68"
                        value={offerA.weeklyWorkHours}
                        onChange={(e) => setOfferA({ weeklyWorkHours: Math.max(30, parseInt(e.target.value, 10) || 40) })}
                        className="w-20 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="number"
                        min="30"
                        max="68"
                        value={offerB.weeklyWorkHours}
                        onChange={(e) => setOfferB({ weeklyWorkHours: Math.max(30, parseInt(e.target.value, 10) || 40) })}
                        className="w-20 bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] px-2.5 py-1 text-zinc-100"
                      />
                    </td>
                  </tr>
                  <tr className="bg-[#18181B]/70">
                    <td className="py-3.5 px-4 font-sans font-semibold text-zinc-100">실질 체감 시급</td>
                    <td className="px-4 font-semibold text-zinc-200">
                      {currentCalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px] text-zinc-500">통근 연 {currentCalc.annualCommuteHours}h</span>
                    </td>
                    <td className={`px-4 font-semibold ${offerACalc.realHourlyWage >= currentCalc.realHourlyWage ? "text-emerald-400" : "text-rose-400"}`}>
                      {offerACalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px] text-zinc-500">통근 연 {offerACalc.annualCommuteHours}h</span>
                    </td>
                    <td className={`px-4 font-semibold ${offerBCalc.realHourlyWage >= currentCalc.realHourlyWage ? "text-emerald-400" : "text-rose-400"}`}>
                      {offerBCalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px] text-zinc-500">통근 연 {offerBCalc.annualCommuteHours}h</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#0A0A0B]/40 text-xs flex items-center justify-between">
              <span className="text-zinc-300">
                동적 비교 결과, 실질 시간 가치가 가장 높은 대안은{" "}
                <strong className="text-zinc-100 font-semibold">{bestOfferName}</strong>입니다.
              </span>
              <span className="font-mono tabular-nums text-[11px] text-zinc-400">
                현재 {currentCalc.realHourlyWage.toLocaleString()} vs A {offerACalc.realHourlyWage.toLocaleString()} vs B{" "}
                {offerBCalc.realHourlyWage.toLocaleString()}원/h
              </span>
            </div>
          </div>
        )}

        {/* TAB 6: SALARY LEDGER */}
        {activeTab === "ledger" && (
          <div className="bg-[#111113] border border-white/[0.08] rounded-[10px] divide-y divide-white/[0.08]">
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-base font-semibold text-zinc-100 tracking-[-0.02em]">6. 기업별 검증 연봉 실태</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ALIO 경영공시·사업보고서 및 전 직군 기준 연봉 벤치마크 원장
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <IconSearch className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="기업명, 직군(TECH), 등급 검색..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/[0.08] rounded-[6px] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/[0.25]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">기관 / 기업</th>
                    <th className="py-2.5 px-4 font-medium">직군 / 포지션</th>
                    <th className="py-2.5 px-4 font-medium">등급</th>
                    <th className="py-2.5 px-4 font-medium">기준 연봉</th>
                    <th className="py-2.5 px-4 font-medium">근거 & 출처</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {filteredLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-[#18181B]/60 transition-colors duration-150">
                      <td className="py-3 px-4 font-medium text-zinc-100">{row.org}</td>
                      <td className="py-3 px-4 text-zinc-300">{row.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] border ${
                            row.tier === "A"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-[#18181B] text-zinc-300 border-white/[0.08]"
                          }`}
                        >
                          Tier {row.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-zinc-100">{row.salary}</td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Monolithic Command Palette + Modals + Slide-Over Detail Drawer */}
      <CommandPalette />
      <ResumeModal />
      <MarketValueModal />
      <SkillGapModal />
      <CrawlerModal />
      <JobDetailModal />
    </div>
  );
}
