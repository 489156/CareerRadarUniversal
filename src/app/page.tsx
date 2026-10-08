"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CareerPassport, JobPosting, SalaryBenchmark, DynamicMatchScore, SkillGapTrack, HardFilters } from "@/lib/types";
import { calculateLifeAdjustedHourlyWage } from "@/lib/calculator";
import { diagnoseJobRisks } from "@/lib/scanner";
import { calculateDynamicJobMatch, EXPANDED_SKILL_GAP_TRACKS, calculateEstimatedMarketValue, evaluateHardFilters } from "@/lib/matcher";
import { CRAWLER_SOURCES, getCrawlerNetworkStats } from "@/lib/crawler";
import { fetchJobsWithCache } from "@/lib/supabase";

import { ResumeModal } from "@/components/ResumeModal";
import { MarketValueModal } from "@/components/MarketValueModal";
import { SkillGapModal } from "@/components/SkillGapModal";
import { CrawlerModal } from "@/components/CrawlerModal";
import { JobDetailModal } from "@/components/JobDetailModal";
export default function Home() {
  const jobsDatabase = useAppStore(state => state.jobsDatabase);
  const setJobsDatabase = useAppStore(state => state.setJobsDatabase);

  useEffect(() => {
    fetchJobsWithCache([]).then(data => {
      setJobsDatabase(data);
    });
  }, []);

  const activeTab = useAppStore(state => state.activeTab);
  const setActiveTab = useAppStore(state => state.setActiveTab);

  // Toast notification state
  const toastMessage = useAppStore(state => state.toastMessage);
  const setToastMessage = useAppStore(state => state.setToastMessage);
  const toastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Global ESC Key Listener for Accessibility
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
  }, []);

  // Passport state
  const passport = useAppStore(state => state.passport);
  const setPassport = useAppStore(state => state.setPassport);

  // Calculator state
  const calcInput = useAppStore(state => state.calcInput);
  const setCalcInput = useAppStore(state => state.setCalcInput);

  // Scanner state
  const scannerText = useAppStore(state => state.scannerText);
  const setScannerText = useAppStore(state => state.setScannerText);
  const scanResult = useAppStore(state => state.scanResult);
  const setScanResult = useAppStore(state => state.setScanResult);

  // Resume Modal
  const isResumeModalOpen = useAppStore(state => state.isResumeModalOpen);
  const setIsResumeModalOpen = useAppStore(state => state.setIsResumeModalOpen);
  const resumeText = useAppStore(state => state.resumeText);
  const setResumeText = useAppStore(state => state.setResumeText);

  // Market Value & Skill Gap Modals
  const isMarketValueModalOpen = useAppStore(state => state.isMarketValueModalOpen);
  const setIsMarketValueModalOpen = useAppStore(state => state.setIsMarketValueModalOpen);
  const isSkillGapModalOpen = useAppStore(state => state.isSkillGapModalOpen);
  const setIsSkillGapModalOpen = useAppStore(state => state.setIsSkillGapModalOpen);
  const activeSkillTrackId = useAppStore(state => state.activeSkillTrackId);
  const setActiveSkillTrackId = useAppStore(state => state.setActiveSkillTrackId);

  // Job Detail Modal State
  const selectedJob = useAppStore(state => state.selectedJob);
  const setSelectedJob = useAppStore(state => state.setSelectedJob);
  const selectedJobMatch = useAppStore(state => state.selectedJobMatch);
  const setSelectedJobMatch = useAppStore(state => state.setSelectedJobMatch);
  const selectedJobHf = useAppStore(state => state.selectedJobHf);
  const setSelectedJobHf = useAppStore(state => state.setSelectedJobHf);

  // Hard Filter Configuration State
  const customKeywordInput = useAppStore(state => state.customKeywordInput);
  const setCustomKeywordInput = useAppStore(state => state.setCustomKeywordInput);
  const showExcludedJobs = useAppStore(state => state.showExcludedJobs);
  const setShowExcludedJobs = useAppStore(state => state.setShowExcludedJobs);

  // Radar Search & Filter
  const radarSearch = useAppStore(state => state.radarSearch);
  const setRadarSearch = useAppStore(state => state.setRadarSearch);
  const radarFilter = useAppStore(state => state.radarFilter);
  const setRadarFilter = useAppStore(state => state.setRadarFilter);

  // Crawler Coverage Modal State
  const isCrawlerModalOpen = useAppStore(state => state.isCrawlerModalOpen);
  const setIsCrawlerModalOpen = useAppStore(state => state.setIsCrawlerModalOpen);
  const crawlerCategoryFilter = useAppStore(state => state.crawlerCategoryFilter);
  const setCrawlerCategoryFilter = useAppStore(state => state.setCrawlerCategoryFilter);
  const crawlerStats = getCrawlerNetworkStats();

  // Ledger Search & Filter
  const ledgerSearch = useAppStore(state => state.ledgerSearch);
  const setLedgerSearch = useAppStore(state => state.setLedgerSearch);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("career_passport_universal");
      if (saved) {
        const p = JSON.parse(saved);
        setPassport((prev: any) => ({
          ...prev,
          ...p,
          hardFilters: p.hardFilters || prev.hardFilters,
        }));
        const totalCash = (parseInt(p.baseSalary) || 5400) + (parseInt(p.fixedAllowance) || 400);
        setCalcInput((prev: any) => ({ ...prev, cashManwon: totalCash }));
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted:", e);
    }
  }, []);

  const handleSavePassport = () => {
    try {
      localStorage.setItem("career_passport_universal", JSON.stringify(passport));
      const totalCash = passport.baseSalary + passport.fixedAllowance;
      setCalcInput((prev: any) => ({ ...prev, cashManwon: totalCash }));
      showToast("✅ Career Passport가 안전하게 로컬에 저장되었습니다.");
    } catch (e) {
      showToast("✅ Career Passport 세션 저장 완료");
    }
  };

  const setTrackPreset = (track: "ENTRY" | "EXPERIENCED") => {
    if (track === "ENTRY") {
      setPassport((prev: any) => ({
        ...prev,
        track: "ENTRY",
        totalYears: 0,
        baseSalary: 0,
        fixedAllowance: 0,
        variableBonus: 0,
        canonicalRole: prev.canonicalRole.includes("인사기획") ? "소프트웨어 개발 / 신입" : prev.canonicalRole,
      }));
      setCalcInput((prev: any) => ({ ...prev, cashManwon: 4500 }));
      showToast("🎓 신입/인턴(0년차) 지원 모드로 전환되었습니다. 인턴 및 대졸공채 공고를 우선 매칭합니다!");
    } else {
      setPassport((prev: any) => ({
        ...prev,
        track: "EXPERIENCED",
        totalYears: prev.totalYears === 0 ? 7 : prev.totalYears,
        baseSalary: prev.baseSalary === 0 ? 5400 : prev.baseSalary,
        fixedAllowance: prev.fixedAllowance === 0 ? 400 : prev.fixedAllowance,
      }));
      setCalcInput((prev: any) => ({ ...prev, cashManwon: 5800 }));
      showToast("💼 경력직 이직 모드로 전환되었습니다.");
    }
  };

  const executePassportSearch = () => {
    handleSavePassport();
    setActiveTab("radar");
    showToast("🎯 입력하신 직무·경력 조건으로 맞춤 공고 탐색을 완료했습니다! (Opportunity Radar 이동)");
  };

  const handleResumeExtract = () => {
    if (!resumeText.trim()) return;
    if (/인사|HR|노무|채용|평가|보상/i.test(resumeText)) {
      setPassport((prev: any) => ({
        ...prev,
        occupation: "HR",
        canonicalRole: "인사기획 & People Operations",
      }));
    }
    const yearMatch = resumeText.match(/(\d+)\s*년/);
    if (yearMatch) {
      setPassport((prev: any) => ({ ...prev, totalYears: parseInt(yearMatch[1], 10) }));
    }
    setIsResumeModalOpen(false);
    showToast("✨ 이력서 텍스트에서 직무와 경력 연차를 추출하여 반영했습니다.");
  };

  // Hard Filter Custom Keyword Handlers
  const addCustomHardFilter = () => {
    const kw = customKeywordInput.trim();
    if (!kw) return;
    if (passport.hardFilters?.customKeywords?.includes(kw)) {
      showToast(`'${kw}' 키워드는 이미 등록되어 있습니다.`);
      return;
    }
    setPassport((prev: any) => ({
      ...prev,
      hardFilters: {
        ...(prev.hardFilters || {
          onlyPermanent: true,
          onlyCapitalArea: true,
          maxCommuteCutoff: true,
          noHeavyFixedOT: false,
          noBelowCurrentSalary: false,
          noRelocationOrg: true,
          customKeywords: [],
        }),
        customKeywords: [...(prev.hardFilters?.customKeywords || []), kw],
      },
    }));
    setCustomKeywordInput("");
    showToast(`🚫 배제 키워드 '${kw}' 추가되었습니다.`);
  };

  const removeCustomHardFilter = (kw: string) => {
    setPassport((prev: any) => ({
      ...prev,
      hardFilters: {
        ...(prev.hardFilters || {
          onlyPermanent: true,
          onlyCapitalArea: true,
          maxCommuteCutoff: true,
          noHeavyFixedOT: false,
          noBelowCurrentSalary: false,
          noRelocationOrg: true,
          customKeywords: [],
        }),
        customKeywords: (prev.hardFilters?.customKeywords || []).filter((k: string) => k !== kw),
      },
    }));
    showToast(`배제 키워드 '${kw}' 제거되었습니다.`);
  };

  const resetHardFilters = () => {
    setPassport((prev: any) => ({
      ...prev,
      hardFilters: {
        onlyPermanent: true,
        onlyCapitalArea: true,
        maxCommuteCutoff: true,
        noHeavyFixedOT: false,
        noBelowCurrentSalary: false,
        noRelocationOrg: true,
        customKeywords: ["교대근무", "파견직", "인턴"],
      },
    }));
    showToast("🔄 절대 배제 조건이 기본값으로 복원되었습니다.");
  };

  // Open Job Detail Modal
  const openJobDetail = (
    job: JobPosting,
    match: DynamicMatchScore,
    hf: { isExcluded: boolean; exclusionReasons: string[] }
  ) => {
    setSelectedJob(job);
    setSelectedJobMatch(match);
    setSelectedJobHf(hf);
  };

  // Send Job to Scanner
  const sendJobToScanner = (job: JobPosting) => {
    const textToScan = job.rawText || `${job.company} - ${job.title}\n급여: ${job.salaryDisplay}\n${job.tags.join(", ")}`;
    setScannerText(textToScan);
    setScanResult(diagnoseJobRisks(textToScan));
    setSelectedJob(null);
    setSelectedJobHf(null);
    setActiveTab("scanner");
    showToast(`⚖️ ${job.company} 공고 원문이 Labor Scanner로 전송되어 정밀 진단되었습니다.`);
  };

  // Market Value Calculations
  const marketValue = calculateEstimatedMarketValue(passport.canonicalRole, passport.totalYears, passport.track);
  const currentTotalCash = passport.baseSalary + passport.fixedAllowance;

  // Filter Jobs with dynamic matching & Hard Filter evaluation
  const jobsWithScores = jobsDatabase.map((job) => ({
    job,
    match: calculateDynamicJobMatch(passport, job),
    hf: evaluateHardFilters(passport, job),
  }));

  const excludedCount = jobsWithScores.filter(({ hf }) => hf.isExcluded).length;

  const filteredJobs = jobsWithScores.filter(({ job, match, hf }) => {
    // Hard filter absolute cutoff: unless showExcludedJobs is checked
    if (!showExcludedJobs && hf.isExcluded) return false;

    // Search query filter
    if (radarSearch.trim()) {
      const q = radarSearch.toLowerCase();
      const matchText = `${job.title} ${job.company} ${job.canonicalRole} ${job.industry} ${job.location} ${job.sourceSystem || ""} ${job.tags.join(" ")}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    // Category pill filter
    if (radarFilter === "entry") {
      return job.minYears === 0 || job.isEntryLevel || (job.tags || []).some((t) => t.includes("신입") || t.includes("인턴")) || job.title.includes("인턴") || job.title.includes("신입");
    }
    if (radarFilter === "tech") return job.occupation === "TECH" || job.title.includes("SW") || job.title.includes("개발") || job.title.includes("Cloud");
    if (radarFilter === "finance") return job.occupation === "FINANCE" || job.title.includes("회계") || job.title.includes("재무");
    if (radarFilter === "marketing") return job.occupation === "MARKETING" || job.title.includes("마케팅");
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
  });

  const highMatchCount = jobsWithScores.filter(({ match, hf }) => match.totalScore >= 88 && (!hf.isExcluded || showExcludedJobs)).length;

  const mockLedger: SalaryBenchmark[] = [
    { id: "1", org: "한국전력공사", role: "대졸 사무직/기획 신입", tier: "A", salary: "4,350만 원", note: "기본급 3,600 + 고정수당 750 (ALIO 공시 초임)", date: "2026-06 (공시)" },
    { id: "2", org: "국민건강보험공단", role: "행정직/인사 신입", tier: "A", salary: "4,020만 원", note: "군미필/무경력 대졸 최하위 직급 기준 (ALIO)", date: "2026-06 (공시)" },
    { id: "3", org: "DN오토모티브", role: "경영지원/인사 대졸신입", tier: "A", salary: "5,400만 원", note: "2026 상반기 공채 공고에 명시된 확정 초임", date: "2026-03 (공고)" },
    { id: "4", org: "수도권 중견 IT", role: "인사기획 5~7년차", tier: "B", salary: "5,800 ~ 6,600만 원", note: "고용노동부 사업체 임금통계 및 실오퍼 제보 집계", date: "2026-09 (제보)" },
    { id: "5", org: "현대모비스", role: "HR 전략 대리/과장", tier: "B", salary: "6,500 ~ 7,800만 원", note: "기본급 6,200 + 경영성과급 별도 (평균 15%)", date: "2026-08 (통계)" },
    { id: "6", org: "신용보증기금", role: "경영지원/HR 정규직", tier: "A", salary: "5,100만 원", note: "ALIO 공시 금융공기업 초임 기준", date: "2026-07 (공시)" },
  ];

  const filteredLedger = mockLedger.filter(
    (item) =>
      item.org.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.role.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      item.tier.toLowerCase().includes(ledgerSearch.toLowerCase())
  );

  const calcResult = calculateLifeAdjustedHourlyWage(calcInput);

  const handleScan = () => {
    if (!scannerText.trim()) return;
    setScanResult(diagnoseJobRisks(scannerText));
    showToast("⚖️ 노동법 위험 조항 진단 완료");
  };

  // Viral Sharing Clipboard Copy
  const copyCalculatorText = () => {
    const dropPct = (((calcResult.nominalHourlyWage - calcResult.realHourlyWage) / calcResult.nominalHourlyWage) * 100).toFixed(1);
    const text = `[Career Radar Universal — 내 실질 체감 시급 진단 결과]
• 명목 연봉: ${calcInput.cashManwon.toLocaleString()}만 원 (단순 명목시급: ${calcResult.nominalHourlyWage.toLocaleString()}원)
• 편도 통근: ${calcInput.commuteMinutesOneway}분 | 주 ${calcInput.weeklyWorkHours}시간 근로 | 주 ${calcInput.weeklyRemoteDays}일 재택
• 연간 통근 누적: ${calcResult.annualCommuteHours}시간 (약 ${(calcResult.annualCommuteHours / 24).toFixed(1)}일) 소모
👉 실질 체감 시급: ${calcResult.realHourlyWage.toLocaleString()}원 (${dropPct}% 체감 하락)
💡 ${calcResult.utilityVerdictText}
출처: https://github.com/489156/CareerRadarUniversal`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("📋 블라인드/커뮤니티 공유용 텍스트가 복사되었습니다!");
    });
  };

  const copyOfferText = () => {
    const text = `[Career Radar Universal — 오퍼 다차원 비교 분석 결과]
• 현재 직장: 확정 5,400만 | 통근 35분 | 실질 시급 22,350원
• Offer A (대기업): 확정 6,200만 (+800) | 통근 75분 ⚠️ | 포괄OT 32h | 실질 시급 19,820원 (-11.3% 하락)
• Offer B (핀테크): 확정 5,800만 (+400) | 통근 40분 | 주2일 재택 | 비포괄 🌟 | 실질 시급 26,450원 (+18.3% 상승)
👉 AI 최종 판정: Offer B가 삶의 시간과 실질 효용 측면에서 최선의 선택입니다. (Offer A 대비 연간 400시간 이상 삶의 여유 확보)
출처: https://github.com/489156/CareerRadarUniversal`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("📋 오퍼 비교 요약이 클립보드에 복사되었습니다!");
    });
  };

  const selectedTrack = EXPANDED_SKILL_GAP_TRACKS.find((t) => t.id === activeSkillTrackId) || EXPANDED_SKILL_GAP_TRACKS[0];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162035] border border-indigo-500/60 text-indigo-200 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 animate-bounce">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/90 border-b border-[#1b2234]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              CR
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white tracking-tight">Career Radar</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Universal v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Universal Career Intelligence & Decision Radar</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1.5 overflow-x-auto py-2">
            {[
              { id: "passport", label: "🪪 Career Passport" },
              { id: "radar", label: "📡 Opportunity Radar" },
              { id: "scanner", label: "⚖️ Labor Risk Scanner" },
              { id: "calculator", label: "💰 Life-Adjusted Value" },
              { id: "matrix", label: "📊 Offer Matrix" },
              { id: "ledger", label: "🏛️ Salary Ledger" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Dynamic Tab Rendering */}
        {activeTab === "passport" && (
          <div className="space-y-6">
            <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1d273d] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>🪪 Universal Career Passport</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">내 커리어 원장</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">노동시장 전체와 실시간 연동되는 다차원 구조화 커리어 원장</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsResumeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                  >
                    📄 이력서 파싱
                  </button>
                  <button
                    onClick={handleSavePassport}
                    className="px-3 py-2 rounded-xl bg-[#18233c] hover:bg-[#202f50] text-xs font-semibold text-slate-300 border border-[#27385c] transition"
                  >
                    💾 저장
                  </button>
                  <button
                    onClick={executePassportSearch}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>맞춤 공고 탐색 실행 ➔</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-4 bg-[#0a0e17] p-4 rounded-xl border border-[#192235]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">1. 직무 및 경력 계층</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {passport.track === "ENTRY" ? "🎓 신입/인턴 트랙" : "💼 경력 트랙"}
                    </span>
                  </div>

                  {/* Track Toggle */}
                  <div className="flex items-center space-x-1.5 p-1 bg-[#121a2d] rounded-xl border border-[#233252]">
                    <button
                      type="button"
                      onClick={() => setTrackPreset("ENTRY")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                        passport.track === "ENTRY" ? "bg-emerald-600 text-white shadow-md" : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>🎓 신입/인턴 (0년차)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackPreset("EXPERIENCED")}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                        passport.track !== "ENTRY" ? "bg-indigo-600 text-white shadow-md" : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>💼 경력직 이직</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-medium">직군 분야 (Job Family)</label>
                    <select
                      value={passport.occupation}
                      onChange={(e) => setPassport({ ...passport, occupation: e.target.value as any })}
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
                    <label className="text-xs text-slate-300 font-medium">자유 직무명 및 핵심 키워드 (Role & Keywords)</label>
                    <input
                      type="text"
                      value={passport.canonicalRole}
                      onChange={(e) => setPassport({ ...passport, canonicalRole: e.target.value })}
                      placeholder="예: 프론트엔드 React, 회계사, 퍼포먼스 마케팅, 인사기획, 컨설팅"
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">자유 키워드와 연차를 분석하여 온톨로지 매칭 및 코호트 시장가치를 동적 산출합니다.</p>
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
                      onChange={(e) => setPassport({ ...passport, totalYears: parseInt(e.target.value) || 0 })}
                      className="w-full mt-2 accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-[#0a0e17] p-4 rounded-xl border border-[#192235]">
                  <h3 className="text-xs font-bold uppercase text-emerald-400 tracking-wider">2. 현재 보상 체계 (퇴직금 제외)</h3>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">기본급 (연간, 만 원)</label>
                    <input
                      type="number"
                      value={passport.baseSalary}
                      onChange={(e) => setPassport({ ...passport, baseSalary: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">고정수당/식대 (연간, 만 원)</label>
                    <input
                      type="number"
                      value={passport.fixedAllowance}
                      onChange={(e) => setPassport({ ...passport, fixedAllowance: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-emerald-400 font-semibold mt-1.5">
                      확정 현금: {(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만 원
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-[#0a0e17] p-4 rounded-xl border border-[#192235]">
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
                      onChange={(e) => setPassport({ ...passport, commuteToleranceMinutes: parseInt(e.target.value) || 60 })}
                      className="w-full mt-2 accent-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hard Filter Configuration Panel */}
              <div className="bg-[#0a0e17] p-5 rounded-xl border border-rose-500/20 space-y-4">
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
                      체크된 절대 배제 기준에 단 하나라도 위배되는 공고는 Opportunity Radar에서 자동 제외(Cutoff)됩니다.
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

                {/* 6 Preset Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                  <label className="flex items-center space-x-2.5 bg-[#0e1526] hover:bg-[#141e36] p-3 rounded-xl border border-[#233252] cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={passport.hardFilters?.onlyPermanent ?? true}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, onlyPermanent: e.target.checked },
                        })
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
                      checked={passport.hardFilters?.onlyCapitalArea ?? true}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, onlyCapitalArea: e.target.checked },
                        })
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
                      checked={passport.hardFilters?.maxCommuteCutoff ?? true}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, maxCommuteCutoff: e.target.checked },
                        })
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
                      checked={passport.hardFilters?.noHeavyFixedOT ?? false}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, noHeavyFixedOT: e.target.checked },
                        })
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
                      checked={passport.hardFilters?.noBelowCurrentSalary ?? false}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, noBelowCurrentSalary: e.target.checked },
                        })
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
                      checked={passport.hardFilters?.noRelocationOrg ?? true}
                      onChange={(e) =>
                        setPassport({
                          ...passport,
                          hardFilters: { ...passport.hardFilters, noRelocationOrg: e.target.checked },
                        })
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
                      placeholder="배제할 단어 입력 (예: 교대근무, 현장직, 인턴, 야간당직)..."
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
                    {(passport.hardFilters?.customKeywords || []).map((kw) => (
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
                    {(passport.hardFilters?.customKeywords || []).length === 0 && (
                      <span className="text-[11px] text-slate-500">등록된 직접 배제 키워드가 없습니다.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Interactive Market Intelligence Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Card 1: Estimated Market Value with Modal Trigger */}
              <div
                onClick={() => setIsMarketValueModalOpen(true)}
                className="bg-[#101625] border border-[#1d273d] hover:border-indigo-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span className="group-hover:text-indigo-300 transition font-medium">내 시장 가치 추정 (P25~P75)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Tier B (n=47)
                  </span>
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-white flex items-center justify-between">
                  <span>{marketValue.rangeDisplay}</span>
                  <span className="text-xs text-indigo-400 opacity-80 group-hover:opacity-100 font-sans font-normal">
                    산출 근거 🔍
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  수도권 / 인사기획 / {passport.totalYears}년차 코호트 기준 (클릭 시 통계 공식 확인)
                </p>
              </div>

              {/* Card 2: High Match Opportunities */}
              <div
                onClick={() => setActiveTab("radar")}
                className="bg-[#101625] border border-[#1d273d] hover:border-emerald-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span className="group-hover:text-emerald-300 transition font-medium">동적 매칭 고적합 공고</span>
                  <span className="text-emerald-400 text-xs font-mono font-bold">HIGH MATCH</span>
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-emerald-400 flex items-center justify-between">
                  <span>{highMatchCount}건 탐색됨</span>
                  <span className="text-xs text-emerald-400 font-sans font-normal">공고 보기 ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">내 패스포트 조건과 88% 이상 부합 (클릭 시 레이더 이동)</p>
              </div>

              {/* Card 3: Skill Gap +28 Items with Modal Trigger */}
              <div
                onClick={() => setIsSkillGapModalOpen(true)}
                className="bg-[#101625] border border-[#1d273d] hover:border-indigo-500/70 transition rounded-2xl p-5 cursor-pointer group shadow-lg"
              >
                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span className="group-hover:text-indigo-300 transition font-medium">스킬 갭 보완 시 확장 시장</span>
                  <span className="text-indigo-400 text-xs font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    +28건 확장
                  </span>
                </div>
                <div className="mt-2 text-xl font-bold font-mono text-indigo-400 flex items-center justify-between">
                  <span>People Analytics 외 2개</span>
                  <span className="text-xs text-indigo-400 font-sans font-normal">상세 28건 ➔</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">3대 전략 스킬 확보 시 열리는 28개 타깃 포지션 보기</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "radar" && (
          <div className="space-y-5">
            {/* Guide & Live Crawler Status Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-lg">🎯</div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-white text-sm">2단계: AI 맞춤 추천 공고 탐색</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>18개 자체 수집망 실시간 가동 중</span>
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">대형 잡포털에 올라오지 않는 대기업 자사 채용 사이트 및 공공기관(ALIO) 공고를 내 프로필과 실시간 매칭합니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCrawlerModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition whitespace-nowrap shadow-sm"
              >
                수집망 18곳 보기 🔍
              </button>
            </div>

            {/* Structured Search & Filters */}
            <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>📡 공고 조건 검색 및 필터</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                      총 {filteredJobs.length}건 추천됨
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">내 희망 통근({passport.commuteToleranceMinutes}분) 및 경력({passport.totalYears}년차) 기준이 반영되어 있습니다.</p>
                </div>
                <div className="w-full md:w-80">
                  <input
                    type="text"
                    placeholder="🔍 기업명, 공고명, 직무 키워드 검색..."
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* 3-Group Filter Controller */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                {/* Group 1: 직군 분류 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">직군 분야:</span>
                  {[
                    { id: "all", label: "전체 직군" },
                    { id: "tech", label: "💻 IT·개발·데이터" },
                    { id: "finance", label: "💰 금융·재무·회계" },
                    { id: "marketing", label: "📢 마케팅·그로스" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRadarFilter(f.id as any)}
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

                {/* Group 2: 기업 유형 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">기업 유형:</span>
                  {[
                    { id: "exclusive", label: "🏢 자사사이트 단독 (잡포털 미노출)" },
                    { id: "conglomerate", label: "🏭 대기업 / 중견그룹" },
                    { id: "public", label: "🏛️ 공공기관 / 국책금융 (ALIO)" },
                    { id: "consulting", label: "💼 Big4·전략컨설팅" },
                    { id: "globalTech", label: "🌐 글로벌 테크 / 외투" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRadarFilter(f.id as any)}
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

                {/* Group 3: 핵심 혜택 및 조건 */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px] w-16">핵심 조건:</span>
                  {[
                    { id: "entry", label: "🎓 신입 / 인턴 우선" },
                    { id: "highMatch", label: "🎯 적합도 85%+ 강력 추천" },
                    { id: "commuteFit", label: `🚗 통근 ${passport.commuteToleranceMinutes}분 이내` },
                    { id: "nonOT", label: "🌟 비포괄 임금제 (야근수당 별도)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRadarFilter(f.id as any)}
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

              {/* Hard Filter Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">
                  🛡️ 절대 배제 조건(지방 근무, 계약직 등)에 걸려 <strong className="text-rose-400 font-mono">{excludedCount}건</strong>이 자동 제외되었습니다.
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

            {/* Job Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-[#101625] border border-[#1d273d] rounded-2xl text-slate-400 text-sm">
                  검색 조건에 부합하는 포지션이 없습니다. 필터를 재조정해보세요.
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
                      {/* Hard Filter Exclusion Banner */}
                      {hf.isExcluded && (
                        <div className="mb-3 p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold flex items-start space-x-2">
                          <span className="text-base leading-none">🚫</span>
                          <div>
                            <span className="font-bold text-rose-400">[내 절대 배제 조건 위반]</span>
                            <span className="text-[11px] text-rose-200 ml-1.5">{hf.exclusionReasons.join(" • ")}</span>
                          </div>
                        </div>
                      )}

                      {/* Header: Company & Title & Fit Score */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-200">{job.company}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                              {job.industry}
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

                        {/* Fit Score Badge */}
                        <div className="flex-shrink-0 text-center bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl">
                          <span
                            className={`text-2xl font-mono font-black block leading-none ${
                              match.totalScore >= 88 ? "text-emerald-400" : match.totalScore >= 75 ? "text-sky-400" : "text-amber-400"
                            }`}
                          >
                            {match.totalScore}%
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">AI 적합도</span>
                        </div>
                      </div>

                      {/* Clean 4-Metric Grid */}
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

                      {/* Salary & Commute Highlight Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800/90 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-300">💰 예상 연봉:</span>
                          <span className="font-mono text-slate-100 font-bold">{job.salaryDisplay}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            job.salaryTier === "A" ? "bg-emerald-500/20 text-emerald-400" : "bg-sky-500/20 text-sky-400"
                          }`}>
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

                      {/* Key Reasons Checklist */}
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

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-800 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300 text-[10px]">
                          {job.sourceSystem || job.sourceName}
                        </span>
                        {!job.hasFixedOT && (
                          <span className="text-emerald-400 font-bold text-[10px]">★ 비포괄(수당별도)</span>
                        )}
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
                )))}
            </div>
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>⚖️ Labor Risk & Toxic Clause Scanner</span>
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  독소조항 실시간 정밀 스캔
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                포괄임금 악용, 퇴직금 분할 약정, 수습기간 감액 등 근로기준법상 독소조항을 즉시 감지합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <textarea
                  rows={11}
                  value={scannerText}
                  onChange={(e) => setScannerText(e.target.value)}
                  placeholder="공고 텍스트를 붙여넣으세요 (예: 포괄임금 연봉 5,000만 원, 수습 80% 지급 등)..."
                  className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleScan}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 transition"
                >
                  실시간 계약 리스크 진단 실행
                </button>
              </div>

              <div className="bg-[#0b0f19] border border-[#1f293d] rounded-xl p-5">
                {scanResult ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-[#1f293d] pb-2">
                      <span className="text-xs font-bold text-rose-400">진단 결과 ({scanResult.warnings.length}건 위험 감지)</span>
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
                        <p className="text-xs text-slate-400 mt-1">포괄임금, 퇴직금 분할, 불법 감액 등 리스크 요인이 감지되지 않았습니다.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-16 text-xs">
                    왼쪽에 공고 본문을 입력하거나 Opportunity Radar에서 [공고 상세 & 리스크 분석]을 눌러 전송하세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">💰 실질 체감 시급 계산기 (Life-Adjusted Value)</h2>
                <button
                  onClick={copyCalculatorText}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-semibold border border-slate-700 transition"
                >
                  📋 공유용 텍스트 복사
                </button>
              </div>
              <p className="text-xs text-slate-400">
                단순 명목 연봉의 착시를 걷어내고, 통근 시간과 초과 근로를 반영한 진짜 실질 시급을 계산합니다.
              </p>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">확정 연간 현금 (기본급+고정수당)</label>
                  <span className="font-bold text-emerald-400 font-mono">{calcInput.cashManwon.toLocaleString()}만 원</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="15000"
                  step="100"
                  value={calcInput.cashManwon}
                  onChange={(e) => setCalcInput({ ...calcInput, cashManwon: parseInt(e.target.value) || 0 })}
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
                  onChange={(e) => setCalcInput({ ...calcInput, commuteMinutesOneway: parseInt(e.target.value) || 0 })}
                  className="w-full mt-2 accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">주당 실근로시간 (야근 포함)</label>
                  <span className="font-bold text-rose-400 font-mono">{calcInput.weeklyWorkHours}시간</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="68"
                  step="2"
                  value={calcInput.weeklyWorkHours}
                  onChange={(e) => setCalcInput({ ...calcInput, weeklyWorkHours: parseInt(e.target.value) || 40 })}
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
                  onChange={(e) => setCalcInput({ ...calcInput, weeklyRemoteDays: parseInt(e.target.value) || 0 })}
                  className="w-full mt-2 accent-purple-500"
                />
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#1f293d] rounded-xl p-6 space-y-5 flex flex-col justify-center">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400">실질 체감 시급 (Life-Adjusted Hourly Wage)</span>
                <div className="text-4xl font-mono font-extrabold text-emerald-400 mt-1">
                  {calcResult.realHourlyWage.toLocaleString()}원
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  단순 명목 시급: <span className="font-mono">{calcResult.nominalHourlyWage.toLocaleString()}원</span> (
                  {(((calcResult.nominalHourlyWage - calcResult.realHourlyWage) / calcResult.nominalHourlyWage) * 100).toFixed(1)}% 체감 하락)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-[#1f293d] py-3">
                <div>
                  <span className="text-slate-500">연간 소모 통근 시간</span>
                  <div className="font-bold font-mono text-slate-200 mt-0.5">{calcResult.annualCommuteHours}시간 (약 {(calcResult.annualCommuteHours / 24).toFixed(1)}일)</div>
                </div>
                <div>
                  <span className="text-slate-500">실질 시간 대비 보상</span>
                  <div className="font-bold font-mono text-indigo-400 mt-0.5">상위 18% 효용</div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 leading-relaxed">
                💡 {calcResult.utilityVerdictText}
              </div>
            </div>
          </div>
        )}

        {activeTab === "matrix" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">📊 Offer Comparison Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">복수 이직 제안의 연봉, 통근, 복리후생, 실질 시급 다차원 시뮬레이션</p>
              </div>
              <button
                onClick={copyOfferText}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-semibold border border-slate-700 transition"
              >
                📋 오퍼 비교 요약 복사
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f293d] text-slate-400">
                    <th className="py-3 px-3">평가 항목</th>
                    <th className="py-3 px-3">현재 직장</th>
                    <th className="py-3 px-3 text-indigo-400">Offer A (대기업)</th>
                    <th className="py-3 px-3 text-emerald-400">Offer B (핀테크)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-mono">
                  <tr>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-300">확정 기본급</td>
                    <td className="px-3 text-slate-200">5,400만 원</td>
                    <td className="px-3 text-indigo-400">6,200만 원 (+800)</td>
                    <td className="px-3 text-emerald-400">5,800만 원 (+400)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-300">편도 통근 시간</td>
                    <td className="px-3 text-slate-200">35분</td>
                    <td className="px-3 text-rose-400">75분 ⚠️ (체력 소모 심각)</td>
                    <td className="px-3 text-emerald-400">40분 (주 2일 재택)</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-300">포괄임금 여부</td>
                    <td className="px-3 text-slate-200">포괄 20h</td>
                    <td className="px-3 text-rose-400">포괄 32h ⚠️</td>
                    <td className="px-3 text-emerald-400 font-bold">비포괄 (수당 1.5배 실비 정산) 🌟</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-300">실질 체감 시급</td>
                    <td className="px-3 text-slate-200">22,350원</td>
                    <td className="px-3 text-rose-400">19,820원 (-11.3%) 📉</td>
                    <td className="px-3 text-emerald-400 font-bold">26,450원 (+18.3%) 🚀</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#0a0e17] rounded-xl border border-[#192235] text-xs space-y-1">
              <span className="font-bold text-sky-400">💡 전문가 제언:</span>
              <p className="text-slate-300">
                Offer A는 명목 연봉이 800만 원 높지만, 긴 통근 시간과 포괄 32시간 근무로 인해 실질 시급이 오히려 11.3% 하락합니다.
                Offer B를 선택하는 것이 연간 400시간 이상의 여가 시간과 높은 실질 체감 시급을 동시에 보장받는 최적의 의사결정입니다.
              </p>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">🏛️ 3-Tier Evidence-Backed Salary Ledger</h2>
                <p className="text-xs text-slate-400">검증 등급별(Tier A/B/C) 투명한 보상 기준 원장</p>
              </div>
              <input
                type="text"
                placeholder="기업명, 직무 검색..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f293d] text-slate-400">
                    <th className="py-2.5 px-3">기관/기업</th>
                    <th className="py-2.5 px-3">직무</th>
                    <th className="py-2.5 px-3">증거 등급</th>
                    <th className="py-2.5 px-3">명시 연봉</th>
                    <th className="py-2.5 px-3">비고 & 출처</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-mono">
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

      <ResumeModal />
      <MarketValueModal />
      <SkillGapModal />
      <CrawlerModal />
      <JobDetailModal />
    </div>
  );
}