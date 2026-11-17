"use client";

import React, { useEffect } from "react";
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

  useEffect(() => {
    fetchJobsWithCache(MOCK_JOB_DATABASE).then((data) => {
      if (data && data.length > 0) setJobsDatabase(data);
    });
  }, [setJobsDatabase]);

  // Global ESC key closes open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsResumeModalOpen(false);
        setIsCrawlerModalOpen(false);
        setIsMarketValueModalOpen(false);
        setIsSkillGapModalOpen(false);
        setSelectedJob(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsResumeModalOpen, setIsCrawlerModalOpen, setIsMarketValueModalOpen, setIsSkillGapModalOpen, setSelectedJob]);

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
      showToast("✅ 커리어 조건이 브라우저에 안전하게 저장되었습니다.");
    } catch {
      showToast("✅ 커리어 조건 세션 반영 완료");
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
      showToast("🎓 신입/인턴(0년차) 지원 모드로 전환되었습니다.");
    } else {
      setPassport((prev) => ({
        ...prev,
        track: "EXPERIENCED",
        totalYears: prev.totalYears === 0 ? 5 : prev.totalYears,
        baseSalary: prev.baseSalary === 0 ? 5400 : prev.baseSalary,
        fixedAllowance: prev.fixedAllowance === 0 ? 400 : prev.fixedAllowance,
      }));
      setCalcInput((prev) => ({ ...prev, cashManwon: 5800 }));
      showToast("💼 경력직 이직 모드로 전환되었습니다.");
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
    showToast("🎯 입력하신 직무·경력 조건으로 맞춤 공고 탐색을 실행했습니다.");
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
    showToast(`🚫 배제 키워드 '${kw}' 추가되었습니다.`);
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
    showToast("🔄 절대 배제 조건이 기본값으로 복원되었습니다.");
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
    showToast(`⚖️ ${job.company} 공고 원문이 근로계약 위험 진단으로 전송되었습니다.`);
  };

  // Market value & skill gap tracks (strictly pass explicit occupation + company tier)
  const marketValue = calculateEstimatedMarketValue(
    `${passport.canonicalRole} ${passport.occupation}`,
    passport.totalYears,
    passport.track,
    mapCompanyTypeToTier(passport.companyType)
  );
  const skillGapTracks = calculateSkillGapTracks(passport);
  const totalSkillGapExpanded = skillGapTracks.reduce((sum, t) => sum + t.expandedCount, 0);

  // Match & Hard Filter pipeline sorted descending by fit score
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

  // Life-Adjusted Calculator
  const calcResult = calculateLifeAdjustedHourlyWage(calcInput);
  const dropPct =
    calcResult.nominalHourlyWage > 0
      ? (
          ((calcResult.nominalHourlyWage - calcResult.realHourlyWage) /
            calcResult.nominalHourlyWage) *
          100
        ).toFixed(1)
      : "0.0";
  const wageTierBadge =
    calcResult.realHourlyWage >= 32000
      ? "최상위 효용 (시간 대비 고보상)"
      : calcResult.realHourlyWage >= 22000
      ? "양호한 실질 효용 구간"
      : calcResult.realHourlyWage >= 14000
      ? "통근·야근 시간 누수 주의"
      : "고강도 시간 소모 구간";

  // Interactive Offer Comparison Calculations
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
      navigator.clipboard.writeText(text).then(() => showToast(okMsg)).catch(() => showToast("⚠️ 클립보드 접근이 제한되었습니다."));
    } else {
      showToast("⚠️ 이 브라우저 환경에서는 자동 복사가 제한됩니다.");
    }
  };

  const copyCalculatorText = () => {
    const text = `[Career Radar Universal — 내 실질 체감 시급 진단 결과]
• 확정 현금: ${calcInput.cashManwon.toLocaleString()}만 원 (명목시급: ${calcResult.nominalHourlyWage.toLocaleString()}원)
• 편도 통근: ${calcInput.commuteMinutesOneway}분 | 주 ${calcInput.weeklyWorkHours}시간 근로 | 주 ${calcInput.weeklyRemoteDays}일 재택
• 연간 통근 누적: ${calcResult.annualCommuteHours}시간 (약 ${(calcResult.annualCommuteHours / 24).toFixed(1)}일) 소모
👉 실질 체감 시급: ${calcResult.realHourlyWage.toLocaleString()}원 (${dropPct}% 체감 하락)
💡 ${calcResult.utilityVerdictText}`;
    copySafe(text, "📋 실질 시급 요약이 클립보드에 복사되었습니다.");
  };

  const copyOfferText = () => {
    const fmtDiff = (val: number) => {
      if (currentCalc.realHourlyWage <= 0) return "";
      const pct = (((val - currentCalc.realHourlyWage) / currentCalc.realHourlyWage) * 100).toFixed(1);
      return ` (${Number(pct) >= 0 ? "+" : ""}${pct}%)`;
    };
    const text = `[Career Radar Universal — 오퍼 다차원 비교 결과]
• 현재 직장: ${currentAnnualCash.toLocaleString()}만 | 통근 ${calcInput.commuteMinutesOneway}분 | 실질 시급 ${currentCalc.realHourlyWage.toLocaleString()}원
• ${offerA.label}: ${(offerA.baseManwon + offerA.allowanceManwon).toLocaleString()}만 | 통근 ${offerA.commuteMinutesOneway}분 | 실질 시급 ${offerACalc.realHourlyWage.toLocaleString()}원${fmtDiff(offerACalc.realHourlyWage)}
• ${offerB.label}: ${(offerB.baseManwon + offerB.allowanceManwon).toLocaleString()}만 | 통근 ${offerB.commuteMinutesOneway}분 | 실질 시급 ${offerBCalc.realHourlyWage.toLocaleString()}원${fmtDiff(offerBCalc.realHourlyWage)}
👉 삶의 시간·보상 종합 최적안: ${bestOfferName}`;
    copySafe(text, "📋 오퍼 비교 요약이 클립보드에 복사되었습니다.");
  };

  const handleScan = () => {
    if (!scannerText.trim()) {
      showToast("⚠️ 검사할 채용 공고 또는 계약서 문구를 입력해 주세요.");
      return;
    }
    setScanResult(diagnoseJobRisks(scannerText));
    showToast("⚖️ 근로계약 위험 조항 진단 완료");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162035] border border-indigo-500/60 text-indigo-200 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/95 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              CR
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">Career Radar</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  맞춤 채용 & 연봉 분석
                </span>
              </div>
              <p className="text-xs text-slate-400">내 경력·연봉·통근 조건으로 딱 맞는 채용 공고를 찾고 실질 시급을 비교하세요</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            {(
              [
                { id: "passport", label: "👤 1. 내 조건 설정", desc: "직무·연봉·배제 기준" },
                { id: "radar", label: "🎯 2. 맞춤 공고 탐색", desc: "적합도순 추천 공고" },
                { id: "scanner", label: "⚖️ 3. 근로계약 위험 진단", desc: "포괄임금·독소조항 검사" },
                { id: "calculator", label: "⏱️ 4. 실질 체감 시급", desc: "통근·야근 반영 시급" },
                { id: "matrix", label: "📊 5. 이직처 비교", desc: "현 직장 vs 오퍼 비교" },
                { id: "ledger", label: "🏛️ 6. 기업별 연봉 실태", desc: "공시·통계 기반 연봉표" },
              ] as { id: TabId; label: string; desc: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-left transition shrink-0 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold"
                    : "bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <div className="text-xs">{tab.label}</div>
                <div className={`text-[10px] mt-0.5 ${activeTab === tab.id ? "text-indigo-200" : "text-slate-500"}`}>
                  {tab.desc}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === "passport" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="text-2xl mt-0.5">💡</span>
                <div>
                  <h3 className="text-sm font-bold text-white">처음 오셨나요? 1단계에서 내 희망 조건을 먼저 설정해보세요</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    [📄 이력서 파싱]으로 이력서를 붙여넣거나 직무·연차·통근 조건을 입력한 뒤 우측 상단의{" "}
                    <strong className="text-emerald-400">[맞춤 공고 탐색 실행 ➔]</strong> 버튼을 누르세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>👤 1단계: 내 커리어 조건 설정</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      자동 저장 지원
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    입력하신 직무·연차·기업 유형·통근 기준을 바탕으로 공고 적합도와 예상 시장 연봉을 자동 계산합니다.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsResumeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                  >
                    📄 이력서 파싱
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePassport}
                    className="px-3 py-2 rounded-xl bg-[#18233c] hover:bg-[#202f50] text-xs font-semibold text-slate-300 border border-[#27385c] transition"
                  >
                    💾 저장
                  </button>
                  <button
                    type="button"
                    onClick={executePassportSearch}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>맞춤 공고 탐색 실행 ➔</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">1. 직무 및 경력 계층</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {passport.track === "ENTRY" || passport.totalYears === 0 ? "🎓 신입/인턴 트랙" : "💼 경력 트랙"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 p-1 bg-[#121a2d] rounded-xl border border-[#233252]">
                    <button
                      type="button"
                      onClick={() => setTrackPreset("ENTRY")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                        passport.track === "ENTRY" || passport.totalYears === 0
                          ? "bg-emerald-600 text-white shadow-md"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>🎓 신입/인턴 (0년차)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackPreset("EXPERIENCED")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                        passport.track !== "ENTRY" && passport.totalYears > 0
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>💼 경력직 이직</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium">직군 분야 (Job Family)</label>
                    <select
                      value={passport.occupation}
                      onChange={(e) => handleOccupationChange(e.target.value as CareerPassport["occupation"])}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HR">인사 / HR / 피플앤컬처</option>
                      <option value="PLANNING">전략 / 기획 / 컨설팅 / PM</option>
                      <option value="TECH">IT / 소프트웨어 개발 / 데이터·AI</option>
                      <option value="MARKETING">마케팅 / 그로스 / 브랜딩</option>
                      <option value="FINANCE">재무 / 회계 / 투자 / 금융</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium">자유 직무명 및 핵심 키워드</label>
                    <input
                      type="text"
                      value={passport.canonicalRole}
                      onChange={(e) => setPassport({ ...passport, canonicalRole: e.target.value })}
                      placeholder="예: React 프론트엔드, KICPA 회계사, 그로스마케팅"
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                    {passport.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {passport.skills.slice(0, 6).map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px]"
                          >
                            {sk}
                            <button
                              type="button"
                              onClick={() =>
                                setPassport((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter((s) => s !== sk),
                                }))
                              }
                              className="ml-1 text-slate-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-medium">경력 연차</label>
                      <span className="font-bold text-indigo-400 font-mono">
                        {passport.totalYears === 0 ? "0년차 (신입/인턴)" : `${passport.totalYears}년차`}
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
                      className="w-full mt-2 accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                    2. 목표 기업군 및 현재 보상 (퇴직금 제외)
                  </h3>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">목표/현재 기업 유형 (시장가치 코호트)</label>
                    <select
                      value={passport.companyType}
                      onChange={(e) => setPassport({ ...passport, companyType: e.target.value })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="빅테크/유니콘">Tier 1: 빅테크 / 글로벌 테크 / 유니콘 (1.4x)</option>
                      <option value="대기업">Tier 2: 주요 대기업 계열사 (1.25x)</option>
                      <option value="금융/공공기관">Tier 3: 금융권 / 공공기관·공기업 (1.15x)</option>
                      <option value="중견기업">표준: 일반 중견기업 / 전문법인 (1.0x)</option>
                      <option value="스타트업/중소기업">Tier 4: 스타트업 / 강소·중소기업 (0.9x)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">기본급 (연간, 만 원)</label>
                    <input
                      type="number"
                      min="0"
                      value={passport.baseSalary}
                      onChange={(e) => setPassport({ ...passport, baseSalary: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">고정수당/식대 (연간, 만 원)</label>
                    <input
                      type="number"
                      min="0"
                      value={passport.fixedAllowance}
                      onChange={(e) => setPassport({ ...passport, fixedAllowance: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1.5">
                      확정 현금: {(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만 원
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-900/90 p-5 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold uppercase text-sky-400 tracking-wider">3. 지역 및 통근</h3>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">거주지</label>
                    <input
                      type="text"
                      value={passport.homeLocation}
                      onChange={(e) => setPassport({ ...passport, homeLocation: e.target.value })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-medium">최대 허용 편도 통근</label>
                      <span className="font-bold text-sky-400 font-mono">{passport.commuteToleranceMinutes}분</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="120"
                      value={passport.commuteToleranceMinutes}
                      onChange={(e) => setPassport({ ...passport, commuteToleranceMinutes: parseInt(e.target.value, 10) || 60 })}
                      className="w-full mt-2 accent-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hard Filter Configuration Panel */}
              <div className="bg-slate-900/90 p-5 rounded-xl border border-rose-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1b253b] pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <span>🛡️ 절대 배제 조건 (Hard Filter 수동 설정)</span>
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                        STRICT CUTOFF
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      체크된 절대 배제 기준에 단 하나라도 위배되는 공고는 [2. 맞춤 공고 탐색]에서 자동 제외됩니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetHardFilters}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    기본값 복원
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.onlyPermanent}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, onlyPermanent: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      🔒 <strong>정규직만 허용</strong> <span className="text-slate-400 text-[11px]">(계약·파견직 배제)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.onlyCapitalArea}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, onlyCapitalArea: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      📍 <strong>수도권만 허용</strong> <span className="text-slate-400 text-[11px]">(지방 근무지 배제)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.maxCommuteCutoff}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, maxCommuteCutoff: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      🚗 <strong>통근 한도 초과 컷</strong>{" "}
                      <span className="text-slate-400 text-[11px]">({passport.commuteToleranceMinutes}분 초과 배제)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.noHeavyFixedOT}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, noHeavyFixedOT: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      ⏰ <strong>고정OT 20h 초과 배제</strong> <span className="text-slate-400 text-[11px]">(과도한 포괄임금)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.noBelowCurrentSalary}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, noBelowCurrentSalary: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      💰 <strong>현재 확정보상 미만 배제</strong>{" "}
                      <span className="text-slate-400 text-[11px]">({(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만원 미만)</span>
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters.noRelocationOrg}
                      onChange={(e) =>
                        setPassport({ ...passport, hardFilters: { ...passport.hardFilters, noRelocationOrg: e.target.checked } })
                      }
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 accent-indigo-500"
                    />
                    <span className="text-slate-200">
                      🚫 <strong>지방 이전·순환 기관 배제</strong> <span className="text-slate-400 text-[11px]">(혁신도시 등)</span>
                    </span>
                  </label>
                </div>

                {/* Custom Exclusion Keywords */}
                <div className="space-y-2 pt-2 border-t border-[#192235]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">사용자 직접 등록 배제 키워드 (포함 시 즉시 컷)</span>
                    <span className="text-slate-500 text-[11px]">Enter 또는 [추가] 클릭</span>
                  </div>
                  <div className="flex space-x-2">
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
                      placeholder="배제할 단어 입력 (예: 교대근무, 현장직, 일용직, 야간당직)..."
                      className="flex-1 bg-[#111726] border border-[#1f293d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomHardFilter}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {passport.hardFilters.customKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs"
                      >
                        <span>🚫 {kw}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomHardFilter(kw)}
                          className="hover:text-white font-bold ml-1 text-slate-400"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {passport.hardFilters.customKeywords.length === 0 && (
                      <span className="text-[11px] text-slate-500">등록된 직접 배제 키워드가 없습니다.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Interactive Market Intelligence Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div
                onClick={() => setIsMarketValueModalOpen(true)}
                className="bg-[#0f172a] border border-slate-800 hover:border-indigo-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
                  <span className="group-hover:text-indigo-300 transition font-medium whitespace-nowrap">내 시장 가치 추정 (P25~P75)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 whitespace-nowrap shrink-0">
                    {marketValue.confidenceTier.split(" ").slice(0, 2).join(" ")} (n={marketValue.sampleSize})
                  </span>
                </div>
                <div className="mt-2 text-lg xl:text-xl font-bold font-mono text-white flex items-center justify-between gap-2">
                  <span className="whitespace-nowrap">{marketValue.rangeDisplay}</span>
                  <span className="text-xs text-indigo-400 opacity-80 group-hover:opacity-100 font-sans font-normal whitespace-nowrap shrink-0">
                    산출 근거 🔍
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {marketValue.cohortDescription} (클릭 시 통계 공식 확인)
                </p>
              </div>

              <div
                onClick={() => setActiveTab("radar")}
                className="bg-[#0f172a] border border-slate-800 hover:border-emerald-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
                  <span className="group-hover:text-emerald-300 transition font-medium whitespace-nowrap">동적 매칭 고적합 공고</span>
                  <span className="text-emerald-400 text-xs font-mono font-bold whitespace-nowrap shrink-0">HIGH MATCH</span>
                </div>
                <div className="mt-2 text-lg xl:text-xl font-bold font-mono text-emerald-400 flex items-center justify-between gap-2">
                  <span className="whitespace-nowrap">{highMatchCount}건 탐색됨</span>
                  <span className="text-xs text-emerald-400 font-sans font-normal whitespace-nowrap shrink-0">공고 보기 ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">내 패스포트 조건과 88% 이상 부합 (클릭 시 레이더 이동)</p>
              </div>

              <div
                onClick={() => setIsSkillGapModalOpen(true)}
                className="bg-[#0f172a] border border-slate-800 hover:border-indigo-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between gap-2">
                  <span className="group-hover:text-indigo-300 transition font-medium whitespace-nowrap">스킬 갭 보완 시 확장 시장</span>
                  <span className="text-indigo-400 text-xs font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap shrink-0">
                    +{totalSkillGapExpanded}건 확장
                  </span>
                </div>
                <div className="mt-2 text-lg xl:text-xl font-bold font-mono text-indigo-400 flex items-center justify-between gap-2">
                  <span className="truncate pr-2">{skillGapTracks[0].name.split("&")[0].trim()} 외 {skillGapTracks.length - 1}개</span>
                  <span className="text-xs text-indigo-400 font-sans font-normal whitespace-nowrap shrink-0">상세 {totalSkillGapExpanded}건 ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {passport.occupation} 직군 3대 전략 스킬 확보 시 열리는 타깃 포지션 보기
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "radar" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                  🎯
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-sm">2단계: AI 맞춤 추천 공고 탐색</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>실시간 크롤링 + {CRAWLER_SOURCES.length}개 공식 채용관 연동</span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    공공기관(ALIO)·Big4 자사 ATS 일일 수집 공고 및 주요 기업 채용 포지션을 내 프로필 적합도 순으로 추천합니다.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCrawlerModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition whitespace-nowrap shadow-sm"
              >
                연동 채널 {CRAWLER_SOURCES.length}곳 보기 🔍
              </button>
            </div>

            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>📡 공고 조건 검색 및 필터</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                      총 {filteredJobs.length}건 추천됨
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    내 희망 직군({passport.occupation}) · 통근({passport.commuteToleranceMinutes}분) · 경력(
                    {passport.totalYears === 0 ? "신입" : `${passport.totalYears}년차`}) 기준 적합도 순 정렬
                  </p>
                </div>
                <div className="w-full md:w-80 flex space-x-2">
                  <input
                    type="text"
                    placeholder="🔍 기업명, 공고명, 직무 키워드 검색..."
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {(radarFilter !== "all" || radarSearch.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setRadarFilter("all");
                        setRadarSearch("");
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 shrink-0"
                    >
                      초기화
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">직군 분야:</span>
                  {(
                    [
                      { id: "all", label: "전체 직군" },
                      { id: "tech", label: "💻 IT·개발·데이터" },
                      { id: "finance", label: "💰 금융·재무·회계" },
                      { id: "marketing", label: "📢 마케팅·그로스" },
                      { id: "hr", label: "👔 인사·HR" },
                      { id: "planning", label: "📊 전략·기획·컨설팅" },
                    ] as { id: RadarFilterId; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRadarFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition ${
                        radarFilter === f.id
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                          : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">기업 유형:</span>
                  {(
                    [
                      { id: "exclusive", label: "🏢 자사사이트 단독" },
                      { id: "conglomerate", label: "🏭 대기업 / 중견그룹" },
                      { id: "public", label: "🏛️ 공공기관 / 국책금융 (ALIO)" },
                      { id: "consulting", label: "💼 Big4·전략컨설팅" },
                      { id: "globalTech", label: "🌐 글로벌 테크 / 유니콘" },
                    ] as { id: RadarFilterId; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRadarFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition ${
                        radarFilter === f.id
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                          : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">핵심 조건:</span>
                  {(
                    [
                      { id: "entry", label: "🎓 신입 / 인턴 우선" },
                      { id: "highMatch", label: "🎯 적합도 85%+ 강력 추천" },
                      { id: "commuteFit", label: `🚗 통근 ${passport.commuteToleranceMinutes}분 이내` },
                      { id: "nonOT", label: "🌟 비포괄 임금제 (야근수당 별도)" },
                    ] as { id: RadarFilterId; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setRadarFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition ${
                        radarFilter === f.id
                          ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                          : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">
                  🛡️ 절대 배제 조건에 걸려 <strong className="text-rose-400 font-mono">{excludedCount}건</strong>이 자동 제외되었습니다.
                </span>
                <label className="flex items-center space-x-1.5 text-slate-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showExcludedJobs}
                    onChange={(e) => setShowExcludedJobs(e.target.checked)}
                    className="rounded text-indigo-500 bg-slate-900 border-slate-700 accent-indigo-500"
                  />
                  <span>배제된 공고도 함께 보기</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-[#0f172a] border border-slate-800 rounded-2xl text-slate-400 text-sm">
                  검색 조건에 부합하는 포지션이 없습니다. 상단 [초기화] 버튼을 누르거나 배제 조건을 완화해 보세요.
                </div>
              ) : (
                filteredJobs.map(({ job, match, hf }) => (
                  <div
                    key={job.id}
                    className={`group bg-[#0f172a] hover:bg-[#131d35] border ${
                      hf.isExcluded
                        ? "border-rose-900/60 opacity-60 hover:opacity-100"
                        : "border-slate-800 hover:border-indigo-500/50"
                    } rounded-2xl p-5 space-y-4 transition-all duration-200 flex flex-col justify-between shadow-lg shadow-black/20`}
                  >
                    <div>
                      {hf.isExcluded && (
                        <div className="mb-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-start space-x-2">
                          <span className="text-base leading-none">🚫</span>
                          <div>
                            <span className="font-bold text-rose-400">[내 절대 배제 조건 위반]</span>
                            <span className="text-[11px] text-rose-200 ml-1.5">{hf.exclusionReasons.join(" • ")}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-200">{job.company}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                              {job.occupation}
                            </span>
                            {job.isCompanyExclusive && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                                🏢 자사 사이트 단독
                              </span>
                            )}
                            {job.isEntryLevel && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                🎓 신입·인턴
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-extrabold text-white group-hover:text-indigo-200 transition">
                            {job.title}
                          </h3>
                          <p className="text-xs text-indigo-400 font-medium">직무 카테고리: {job.canonicalRole}</p>
                        </div>

                        <div className="flex-shrink-0 text-center bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
                          <span
                            className={`text-2xl font-mono font-black block leading-none ${
                              match.totalScore >= 88
                                ? "text-emerald-400"
                                : match.totalScore >= 70
                                ? "text-sky-400"
                                : "text-amber-400"
                            }`}
                          >
                            {match.totalScore}%
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
                            적합도
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-800/80 my-3 text-[11px]">
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <span className="text-slate-400 text-[10px] block">직무 일치</span>
                          <span className="font-bold text-indigo-400 font-mono text-xs">{match.roleFit}%</span>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <span className="text-slate-400 text-[10px] block">연차 충족</span>
                          <span className="font-bold text-sky-400 font-mono text-xs">{match.seniorityFit}%</span>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <span className="text-slate-400 text-[10px] block">통근 여건</span>
                          <span className="font-bold text-emerald-400 font-mono text-xs">{match.commuteFit}%</span>
                        </div>
                        <div className="bg-slate-900/50 p-2 rounded-lg text-center">
                          <span className="text-slate-400 text-[10px] block">보상 수준</span>
                          <span className="font-bold text-purple-400 font-mono text-xs">{match.salaryFit}%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800/90 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-300">💰 예상 연봉:</span>
                          <span className="font-mono text-slate-100 font-bold">{job.salaryDisplay}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                              job.salaryTier === "A" ? "bg-emerald-500/20 text-emerald-400" : "bg-sky-500/20 text-sky-400"
                            }`}
                          >
                            Tier {job.salaryTier}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <span>🚗 편도 {job.commuteMinutes}분</span>
                          {job.commuteMinutes <= (passport.commuteToleranceMinutes || 60) ? (
                            <span className="text-emerald-400 font-semibold text-[11px]">(통근 안심)</span>
                          ) : (
                            <span className="text-amber-400 font-semibold text-[11px]">(장거리 통근)</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-xs pt-3">
                        {match.matchedReasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="text-emerald-400 text-[11px] flex items-center space-x-1.5">
                            <span className="font-bold">✓</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                        {match.gapReasons.slice(0, 1).map((gap, idx) => (
                          <div key={idx} className="text-amber-400 text-[11px] flex items-center space-x-1.5">
                            <span className="font-bold">▲</span>
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[10px]">
                          {job.sourceSystem || job.sourceName}
                        </span>
                        {!job.hasFixedOT && <span className="text-emerald-400 font-bold text-[10px]">★ 비포괄(수당별도)</span>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => openJobDetail(job, match, hf)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
                        >
                          상세 분석 🔍
                        </button>
                        <button
                          type="button"
                          onClick={() => sendJobToScanner(job)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                        >
                          노동법 진단 ⚖️
                        </button>
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-sm"
                        >
                          지원 원문 ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>⚖️ 3단계: 근로계약 & 채용공고 독소조항 진단기</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    근로기준법 위반 리스크 자동 감지
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-1.5">
                  채용 공고 본문이나 근로계약서 문구를 붙여넣으면{" "}
                  <strong className="text-rose-300">포괄임금제 악용, 퇴직금 분할 약정, 수습기간 감액, 위약 예정 금지</strong> 등
                  독소조항을 감지합니다.
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
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 transition"
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
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition"
                >
                  정상 계약 샘플 넣기
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <textarea
                  rows={11}
                  value={scannerText}
                  onChange={(e) => setScannerText(e.target.value)}
                  placeholder="공고 텍스트를 붙여넣으세요 (예: 포괄임금 연봉 5,000만 원, 수습 80% 지급 등)..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleScan}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 transition"
                >
                  실시간 계약 리스크 진단 실행
                </button>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
                {scanResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className={`text-xs font-bold ${scanResult.isClean ? "text-emerald-400" : "text-rose-400"}`}>
                        진단 결과 ({scanResult.warnings.length}건 위험 감지)
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {scanResult.hasFixedOT ? `고정OT: ${scanResult.fixedOTHours}시간` : "고정OT 없음"}
                      </span>
                    </div>

                    {scanResult.warnings.map((w, idx) => (
                      <div key={idx} className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-rose-400">{w.title}</div>
                        <div className="text-[11px] text-slate-300">{w.desc}</div>
                      </div>
                    ))}

                    {scanResult.isClean && (
                      <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-center">
                        <div className="text-emerald-400 text-sm font-bold">✅ 깨끗하고 투명한 공고 조건입니다.</div>
                        <p className="text-xs text-slate-400 mt-1">
                          포괄임금, 퇴직금 분할, 수습 감액 등 주요 독소조항이 감지되지 않았습니다.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-16 text-xs">
                    왼쪽에 공고 본문을 입력하거나 [2. 맞춤 공고 탐색]에서 [노동법 진단 ⚖️] 버튼을 눌러 전송하세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">⏱️ 4단계: 실질 체감 시급 계산기</h2>
                <button
                  type="button"
                  onClick={copyCalculatorText}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-semibold border border-slate-700 transition"
                >
                  📋 결과 텍스트 복사
                </button>
              </div>
              <p className="text-xs text-slate-300">
                연봉 숫자만 보고 결정하면 통근·야근 시간에 가성비가 무너질 수 있습니다. 왕복 통근 시간과 교통비까지 반영한{" "}
                <strong className="text-emerald-400">진짜 내 시간당 가치</strong>를 계산합니다.
              </p>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">확정 연간 현금 (기본급+고정수당)</label>
                  <span className="font-bold text-emerald-400 font-mono">{calcInput.cashManwon.toLocaleString()}만 원</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="15000"
                  step="100"
                  value={calcInput.cashManwon}
                  onChange={(e) => setCalcInput({ ...calcInput, cashManwon: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-2 accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">편도 통근 시간</label>
                  <span className="font-bold text-sky-400 font-mono">{calcInput.commuteMinutesOneway}분</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={calcInput.commuteMinutesOneway}
                  onChange={(e) => setCalcInput({ ...calcInput, commuteMinutesOneway: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">월 교통비/유류비</label>
                  <span className="font-bold text-amber-400 font-mono">{calcInput.monthlyTransitCostManwon}만 원</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={calcInput.monthlyTransitCostManwon}
                  onChange={(e) => setCalcInput({ ...calcInput, monthlyTransitCostManwon: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-2 accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">주당 실근로시간 (야근 포함)</label>
                  <span className="font-bold text-rose-400 font-mono">{calcInput.weeklyWorkHours}시간</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="68"
                  step="1"
                  value={calcInput.weeklyWorkHours}
                  onChange={(e) => setCalcInput({ ...calcInput, weeklyWorkHours: parseInt(e.target.value, 10) || 40 })}
                  className="w-full mt-2 accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">주당 재택근무 일수</label>
                  <span className="font-bold text-purple-400 font-mono">{calcInput.weeklyRemoteDays}일</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={calcInput.weeklyRemoteDays}
                  onChange={(e) => setCalcInput({ ...calcInput, weeklyRemoteDays: parseInt(e.target.value, 10) || 0 })}
                  className="w-full mt-2 accent-purple-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5 flex flex-col justify-center">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">
                  실질 체감 시급 (Life-Adjusted Hourly Wage)
                </span>
                <div className="text-4xl font-mono font-extrabold text-emerald-400 mt-1">
                  {calcResult.realHourlyWage.toLocaleString()}원
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  단순 명목 시급: <span className="font-mono">{calcResult.nominalHourlyWage.toLocaleString()}원</span> (
                  {dropPct}% 체감 하락)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-800 py-3">
                <div>
                  <span className="text-slate-500">연간 소모 통근 시간</span>
                  <div className="font-bold font-mono text-slate-200 mt-0.5">
                    {calcResult.annualCommuteHours}시간 (약 {(calcResult.annualCommuteHours / 24).toFixed(1)}일)
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">시간 대비 보상 효율</span>
                  <div className="font-bold text-indigo-400 mt-0.5">{wageTierBadge}</div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 leading-relaxed">
                💡 {calcResult.utilityVerdictText}
              </div>
            </div>
          </div>
        )}

        {activeTab === "matrix" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">📊 5단계: 이직처(오퍼) 다차원 실시간 비교표</h2>
                <p className="text-xs text-slate-300 mt-1">
                  내 현재 조건({currentAnnualCash.toLocaleString()}만 원)과 두 이직 제안의 연봉·통근·재택·근로시간을 직접 입력해 실질 시급을 즉시 비교하세요.
                </p>
              </div>
              <button
                type="button"
                onClick={copyOfferText}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-semibold border border-slate-700 transition"
              >
                📋 오퍼 비교 요약 복사
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">평가 항목</th>
                    <th className="py-3 px-3">현재 직장 (패스포트/시급 연동)</th>
                    <th className="py-3 px-3 text-indigo-400">{offerA.label}</th>
                    <th className="py-3 px-3 text-emerald-400">{offerB.label}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  <tr>
                    <td className="py-3 px-3 font-sans font-medium text-slate-300">확정 연봉 (만 원)</td>
                    <td className="px-3 text-slate-200">{currentAnnualCash.toLocaleString()}만 원</td>
                    <td className="px-3">
                      <input
                        type="number"
                        value={offerA.baseManwon + offerA.allowanceManwon}
                        onChange={(e) => setOfferA({ baseManwon: Math.max(0, parseInt(e.target.value, 10) || 0), allowanceManwon: 0 })}
                        className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-indigo-300"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="number"
                        value={offerB.baseManwon + offerB.allowanceManwon}
                        onChange={(e) => setOfferB({ baseManwon: Math.max(0, parseInt(e.target.value, 10) || 0), allowanceManwon: 0 })}
                        className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-sans font-medium text-slate-300">편도 통근 (분)</td>
                    <td className="px-3 text-slate-200">{calcInput.commuteMinutesOneway}분</td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={offerA.commuteMinutesOneway}
                        onChange={(e) => setOfferA({ commuteMinutesOneway: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-indigo-300"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="0"
                        max="180"
                        value={offerB.commuteMinutesOneway}
                        onChange={(e) => setOfferB({ commuteMinutesOneway: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-sans font-medium text-slate-300">주 재택근무 (일)</td>
                    <td className="px-3 text-slate-200">주 {calcInput.weeklyRemoteDays}일</td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={offerA.weeklyRemoteDays}
                        onChange={(e) => setOfferA({ weeklyRemoteDays: Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-indigo-300"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={offerB.weeklyRemoteDays}
                        onChange={(e) => setOfferB({ weeklyRemoteDays: Math.min(5, Math.max(0, parseInt(e.target.value, 10) || 0)) })}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-sans font-medium text-slate-300">주 실근로시간 (시간)</td>
                    <td className="px-3 text-slate-200">{calcInput.weeklyWorkHours}시간</td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="30"
                        max="68"
                        value={offerA.weeklyWorkHours}
                        onChange={(e) => setOfferA({ weeklyWorkHours: Math.max(30, parseInt(e.target.value, 10) || 40) })}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-indigo-300"
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="number"
                        min="30"
                        max="68"
                        value={offerB.weeklyWorkHours}
                        onChange={(e) => setOfferB({ weeklyWorkHours: Math.max(30, parseInt(e.target.value, 10) || 40) })}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-300"
                      />
                    </td>
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="py-3.5 px-3 font-sans font-bold text-white">실질 체감 시급 (산출결과)</td>
                    <td className="px-3 font-bold text-slate-200">
                      {currentCalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px] text-slate-400">통근 연 {currentCalc.annualCommuteHours}h</span>
                    </td>
                    <td className={`px-3 font-bold ${offerACalc.realHourlyWage >= currentCalc.realHourlyWage ? "text-indigo-400" : "text-rose-400"}`}>
                      {offerACalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px]">통근 연 {offerACalc.annualCommuteHours}h</span>
                    </td>
                    <td className={`px-3 font-bold ${offerBCalc.realHourlyWage >= currentCalc.realHourlyWage ? "text-emerald-400" : "text-rose-400"}`}>
                      {offerBCalc.realHourlyWage.toLocaleString()}원
                      <span className="block text-[10px]">통근 연 {offerBCalc.annualCommuteHours}h</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-sky-400">💡 동적 의사결정 판정: {bestOfferName} 우세</span>
              <p className="text-slate-300">
                현재 조건({currentCalc.realHourlyWage.toLocaleString()}원/h), {offerA.label}({offerACalc.realHourlyWage.toLocaleString()}원/h),{" "}
                {offerB.label}({offerBCalc.realHourlyWage.toLocaleString()}원/h) 중 시간당 실질 가치가 가장 높은 대안은{" "}
                <strong className="text-emerald-400">{bestOfferName}</strong>입니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">🏛️ 6단계: 기업별 검증 연봉 실태 원장</h2>
                <p className="text-xs text-slate-300 mt-1">
                  공공경영공시(ALIO)·사업보고서·전 직군 공고 벤치마크를 기반으로 직무별 확정 연봉 구간을 비교합니다.
                </p>
              </div>
              <input
                type="text"
                placeholder="기업명, 직군([TECH]), 등급 검색..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">기관/기업</th>
                    <th className="py-2.5 px-3">직군 / 직무</th>
                    <th className="py-2.5 px-3">신뢰 등급</th>
                    <th className="py-2.5 px-3">기준 연봉</th>
                    <th className="py-2.5 px-3">산출 근거 & 출처</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredLedger.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 px-3 font-sans font-bold text-white">{row.org}</td>
                      <td className="py-3 px-3 font-sans text-slate-300">{row.role}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                            row.tier === "A"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          }`}
                        >
                          Tier {row.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-bold">{row.salary}</td>
                      <td className="py-3 px-3 font-sans text-slate-400 text-[11px]">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Extracted Single-Source-of-Truth Modals */}
      <ResumeModal />
      <MarketValueModal />
      <SkillGapModal />
      <CrawlerModal />
      <JobDetailModal />
    </div>
  );
}
