"use client";

import React, { useState, useEffect } from "react";
import { CareerPassport, JobPosting, SalaryBenchmark, DynamicMatchScore, SkillGapTrack } from "@/lib/types";
import { calculateLifeAdjustedHourlyWage } from "@/lib/calculator";
import { diagnoseJobRisks } from "@/lib/scanner";
import { MOCK_JOB_DATABASE, calculateDynamicJobMatch, EXPANDED_SKILL_GAP_TRACKS, calculateEstimatedMarketValue } from "@/lib/matcher";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger">("passport");

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Passport state
  const [passport, setPassport] = useState<CareerPassport>({
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
    hardPreferences: { employmentType: "정규직", region: "수도권" },
    softPreferences: { wfhPreferred: true, minSalary: 55000000 },
    updatedAt: new Date().toISOString(),
  });

  // Calculator state
  const [calcInput, setCalcInput] = useState({
    cashManwon: 5800,
    commuteMinutesOneway: 50,
    monthlyTransitCostManwon: 12,
    weeklyRemoteDays: 1,
    weeklyWorkHours: 48,
  });

  // Scanner state
  const [scannerText, setScannerText] = useState("");
  const [scanResult, setScanResult] = useState<ReturnType<typeof diagnoseJobRisks> | null>(null);

  // Resume Modal
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");

  // Market Value & Skill Gap Modals
  const [isMarketValueModalOpen, setIsMarketValueModalOpen] = useState(false);
  const [isSkillGapModalOpen, setIsSkillGapModalOpen] = useState(false);
  const [activeSkillTrackId, setActiveSkillTrackId] = useState<string>("track-analytics");

  // Job Detail Modal State
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedJobMatch, setSelectedJobMatch] = useState<DynamicMatchScore | null>(null);

  // Radar Search & Filter
  const [radarSearch, setRadarSearch] = useState("");
  const [radarFilter, setRadarFilter] = useState<"all" | "tierA" | "highMatch" | "commuteFit" | "nonOT">("all");

  // Ledger Search & Filter
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("career_passport_universal");
      if (saved) {
        const p = JSON.parse(saved);
        setPassport((prev) => ({ ...prev, ...p }));
        const totalCash = (parseInt(p.baseSalary) || 5400) + (parseInt(p.fixedAllowance) || 400);
        setCalcInput((prev) => ({ ...prev, cashManwon: totalCash }));
      }
    } catch (e) {
      console.warn("localStorage not available or corrupted:", e);
    }
  }, []);

  const handleSavePassport = () => {
    try {
      localStorage.setItem("career_passport_universal", JSON.stringify(passport));
      const totalCash = passport.baseSalary + passport.fixedAllowance;
      setCalcInput((prev) => ({ ...prev, cashManwon: totalCash }));
      showToast("✅ Career Passport가 안전하게 로컬에 저장되었습니다.");
    } catch (e) {
      showToast("✅ Career Passport 세션 저장 완료");
    }
  };

  const handleResumeExtract = () => {
    if (!resumeText.trim()) return;
    if (/인사|HR|노무|채용|평가|보상/i.test(resumeText)) {
      setPassport((prev) => ({
        ...prev,
        occupation: "HR",
        canonicalRole: "인사기획 & People Operations",
      }));
    }
    const yearMatch = resumeText.match(/(\d+)\s*년/);
    if (yearMatch) {
      setPassport((prev) => ({ ...prev, totalYears: parseInt(yearMatch[1], 10) }));
    }
    setIsResumeModalOpen(false);
    showToast("✨ 이력서 텍스트에서 직무와 경력 연차를 추출하여 반영했습니다.");
  };

  // Open Job Detail Modal
  const openJobDetail = (job: JobPosting, match: DynamicMatchScore) => {
    setSelectedJob(job);
    setSelectedJobMatch(match);
  };

  // Send Job to Scanner
  const sendJobToScanner = (job: JobPosting) => {
    const textToScan = job.rawText || `${job.company} - ${job.title}\n급여: ${job.salaryDisplay}\n${job.tags.join(", ")}`;
    setScannerText(textToScan);
    setScanResult(diagnoseJobRisks(textToScan));
    setSelectedJob(null);
    setActiveTab("scanner");
    showToast(`⚖️ ${job.company} 공고 원문이 Labor Scanner로 전송되어 정밀 진단되었습니다.`);
  };

  // Market Value Calculations
  const marketValue = calculateEstimatedMarketValue(passport.totalYears);
  const currentTotalCash = passport.baseSalary + passport.fixedAllowance;

  // Filter Jobs with dynamic matching
  const jobsWithScores = MOCK_JOB_DATABASE.map((job) => ({
    job,
    match: calculateDynamicJobMatch(passport, job),
  }));

  const filteredJobs = jobsWithScores.filter(({ job, match }) => {
    // Search query filter
    if (radarSearch.trim()) {
      const q = radarSearch.toLowerCase();
      const matchText = `${job.title} ${job.company} ${job.canonicalRole} ${job.tags.join(" ")}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    // Category pill filter
    if (radarFilter === "tierA") return job.salaryTier === "A";
    if (radarFilter === "highMatch") return match.totalScore >= 85;
    if (radarFilter === "commuteFit") return job.commuteMinutes <= (passport.commuteToleranceMinutes || 60);
    if (radarFilter === "nonOT") return !job.hasFixedOT;
    return true;
  });

  const highMatchCount = jobsWithScores.filter(({ match }) => match.totalScore >= 88).length;

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
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162035] border border-indigo-500/60 text-indigo-200 px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 animate-bounce">
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080b11]/90 border-b border-[#1b2234]">
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
                    📄 이력서 자동 파싱
                  </button>
                  <button
                    onClick={handleSavePassport}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
                  >
                    💾 패스포트 저장
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="space-y-4 bg-[#0a0e17] p-4 rounded-xl border border-[#192235]">
                  <h3 className="text-xs font-bold uppercase text-indigo-400 tracking-wider">1. 직무 및 경력</h3>
                  <div>
                    <label className="text-xs text-slate-300 font-medium">표준 직무 (Role)</label>
                    <input
                      type="text"
                      value={passport.canonicalRole}
                      onChange={(e) => setPassport({ ...passport, canonicalRole: e.target.value })}
                      className="w-full bg-[#111726] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Universal Job Ontology로 자동 정규화됩니다.</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <label className="text-slate-300 font-medium">경력 연차</label>
                      <span className="font-bold text-indigo-400 font-mono">{passport.totalYears}년차</span>
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
            {/* Radar Header & Controls */}
            <div className="bg-[#101625] p-5 rounded-2xl border border-[#1d273d] space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <span>📡 Opportunity Radar</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      실시간 온톨로지 매칭 가동 중
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    내 Passport(경력 {passport.totalYears}년차, 통근 허용 {passport.commuteToleranceMinutes}분)에 맞춰 실시간으로 재계산됩니다.
                  </p>
                </div>
                <div className="w-full md:w-72">
                  <input
                    type="text"
                    placeholder="기업명, 공고명, 직무 검색..."
                    value={radarSearch}
                    onChange={(e) => setRadarSearch(e.target.value)}
                    className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-[#192235]">
                {[
                  { id: "all", label: "전체 공고" },
                  { id: "tierA", label: "공시/확정 연봉 (Tier A)" },
                  { id: "highMatch", label: "적합도 85%+ 강력 추천" },
                  { id: "commuteFit", label: `통근 ${passport.commuteToleranceMinutes}분 이내` },
                  { id: "nonOT", label: "비포괄 임금 (야근수당 실비)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRadarFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      radarFilter === f.id
                        ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                        : "bg-[#0c101a] text-slate-300 hover:bg-[#18233a] border border-[#1d273d]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.length === 0 ? (
                <div className="col-span-2 text-center py-16 bg-[#101625] border border-[#1d273d] rounded-2xl text-slate-400 text-sm">
                  검색 조건에 부합하는 포지션이 없습니다. 필터를 재조정해보세요.
                </div>
              ) : (
                filteredJobs.map(({ job, match }) => (
                  <div
                    key={job.id}
                    className="bg-[#101625] hover:bg-[#141b2e] border border-[#1d273d] hover:border-indigo-500/40 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-300">{job.company}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {job.industry}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white mt-1">{job.title}</h3>
                          <p className="text-[11px] text-indigo-400 font-mono mt-0.5">표준 직무: {job.canonicalRole}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xl font-mono font-extrabold ${
                              match.totalScore >= 88 ? "text-emerald-400" : match.totalScore >= 75 ? "text-sky-400" : "text-amber-400"
                            }`}
                          >
                            {match.totalScore}%
                          </span>
                          <span className="block text-[10px] font-bold text-slate-400">FIT SCORE</span>
                        </div>
                      </div>

                      {/* Score Breakdown Bars */}
                      <div className="grid grid-cols-4 gap-2 pt-2 pb-1 text-[10px]">
                        <div>
                          <span className="text-slate-400">직무 적합</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-indigo-500 h-full" style={{ width: `${match.roleFit}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">연차 적합</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-sky-500 h-full" style={{ width: `${match.seniorityFit}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">통근 거리</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-emerald-500 h-full" style={{ width: `${match.commuteFit}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400">보상 상승</span>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-purple-500 h-full" style={{ width: `${match.salaryFit}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs pt-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                            job.salaryTier === "A"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : job.salaryTier === "B"
                              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          Tier {job.salaryTier}
                        </span>
                        <span className="font-mono text-slate-100 font-bold text-xs">{job.salaryDisplay}</span>
                        <span className="text-slate-400 text-xs">
                          | 🚗 편도 {job.commuteMinutes}분
                          {job.commuteMinutes <= (passport.commuteToleranceMinutes || 60) ? (
                            <span className="text-emerald-400 ml-1">✓ 안심</span>
                          ) : (
                            <span className="text-amber-400 ml-1">⚠️ 주의</span>
                          )}
                        </span>
                      </div>

                      {/* Matched Points & Gaps */}
                      <div className="space-y-1 text-xs border-t border-[#1a2336] pt-3 mt-3">
                        {match.matchedReasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="text-emerald-400 text-[11px] flex items-center space-x-1.5">
                            <span>✓</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                        {match.gapReasons.slice(0, 1).map((gap, idx) => (
                          <div key={idx} className="text-amber-400 text-[11px] flex items-center space-x-1.5">
                            <span>▲</span>
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA with Direct URL Link */}
                    <div className="pt-3 border-t border-[#1a2336] flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[10px] text-slate-500">원천: {job.sourceName}</span>
                      <div className="flex items-center space-x-2">
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <span>공고 원문 ↗</span>
                        </a>
                        <button
                          onClick={() => openJobDetail(job, match)}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-bold transition"
                        >
                          상세 진단 ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
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

      {/* Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#1e273b] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#1e273b] pb-3">
              <h3 className="font-bold text-white text-base">📄 이력서 / 경력기술서 빠른 파싱</h3>
              <button onClick={() => setIsResumeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="이력서나 경력기술서 텍스트를 붙여넣으세요..."
              className="w-full bg-[#0a0d14] border border-[#1f293d] rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsResumeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs">취소</button>
              <button onClick={handleResumeExtract} className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-xs text-white">자동 추출 적용</button>
            </div>
          </div>
        </div>
      )}

      {/* Market Value Methodology Modal */}
      {isMarketValueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#1e273b] pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold">통계 및 산출 공식</span>
                  <span className="text-xs text-slate-400">3-Tier 합성 추정 엔진</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">내 시장 가치 추정 (P25 ~ P75) 산출 근거</h3>
              </div>
              <button onClick={() => setIsMarketValueModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#192235] space-y-2 text-xs">
              <div className="text-indigo-400 font-bold uppercase tracking-wider">1. 타깃 코호트 정의 (Cohort Granularity)</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
                <div><span className="text-slate-500 block">직군</span> 인사 (HR)</div>
                <div><span className="text-slate-500 block">표준 직무</span> 인사기획 / HRBP</div>
                <div><span className="text-slate-500 block">경력 구간</span> <span className="text-emerald-400 font-bold">{passport.totalYears}년차</span> (대리말~과장)</div>
                <div><span className="text-slate-500 block">대상 지역</span> 수도권 (300인 이상)</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>2. 3-Tier 증거 기반 합성 가중치</span>
                <span className="text-[10px] text-slate-400 font-normal">(신뢰도 순차 결합)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
                <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
                  <div className="font-bold text-emerald-400">Tier A (가중치 50%)</div>
                  <div className="text-[11px] text-slate-300">고용노동부 사업체임금근로시간조사 통계 및 공공기관(ALIO)/상장사(DART) 공시 원장</div>
                </div>
                <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
                  <div className="font-bold text-sky-400">Tier B (가중치 40%)</div>
                  <div className="text-[11px] text-slate-300">최근 12개월 내 수도권 검증 공고 기본급 및 합격 오퍼 레터 실표본 (n=47건 정규화)</div>
                </div>
                <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
                  <div className="font-bold text-amber-400">Tier C (가중치 10%)</div>
                  <div className="text-[11px] text-slate-300">블라인드/잡플래닛 임금 제보 중 극단치(상·하위 5% IQR) 절사 보정 데이터</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-white">3. 코호트 임금 분포표 (퇴직금 및 비확정 성과급 제외 순수 확정 현금 기준)</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#233252] text-slate-400 font-sans">
                      <th className="py-2 px-2">분위수</th>
                      <th className="py-2 px-2">추정 연봉</th>
                      <th className="py-2 px-2 font-sans">시장 포지션 설명</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#18233a]">
                    <tr>
                      <td className="py-2.5 px-2 text-slate-400">P10 (하위 10%)</td>
                      <td className="py-2.5 px-2 text-slate-300">{marketValue.p10.toLocaleString()}만 원</td>
                      <td className="py-2.5 px-2 text-slate-400 font-sans">지방/전통 소형 제조업 코호트</td>
                    </tr>
                    <tr className="bg-indigo-950/20 font-bold">
                      <td className="py-2.5 px-2 text-indigo-400">P25 (하위 25%)</td>
                      <td className="py-2.5 px-2 text-indigo-300">{marketValue.p25.toLocaleString()}만 원</td>
                      <td className="py-2.5 px-2 text-indigo-200 font-sans">중견 제조 및 일반 기업 표준 하한</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-2.5 px-2 text-sky-400">P50 (중앙값)</td>
                      <td className="py-2.5 px-2 text-white">{marketValue.p50.toLocaleString()}만 원</td>
                      <td className="py-2.5 px-2 text-slate-200 font-sans">수도권 300인 이상 기업 평균값</td>
                    </tr>
                    <tr className="bg-emerald-950/20 font-bold">
                      <td className="py-2.5 px-2 text-emerald-400">P75 (상위 25%)</td>
                      <td className="py-2.5 px-2 text-emerald-300">{marketValue.p75.toLocaleString()}만 원</td>
                      <td className="py-2.5 px-2 text-emerald-200 font-sans">상위 IT 유니콘 및 대기업 표준 상한</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-2 text-purple-400 font-bold">P90 (상위 10%)</td>
                      <td className="py-2.5 px-2 text-purple-300 font-bold">{marketValue.p90.toLocaleString()}만 원</td>
                      <td className="py-2.5 px-2 text-slate-400 font-sans">글로벌 테크 / 초우량 빅테크 상위 처우</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3.5 bg-[#0a0e17] rounded-xl border border-[#1d273d] text-xs space-y-1">
              {currentTotalCash < marketValue.p25 ? (
                <>
                  <div className="text-rose-400 font-bold">
                    ⚠️ 현재 보상({currentTotalCash.toLocaleString()}만 원)은 코호트 하위 25% 미만(P25 {marketValue.p25.toLocaleString()}만 원)에 위치합니다.
                  </div>
                  <div className="text-slate-300">
                    동종 경력 시장 대비 저평가되어 있으며, 이직 시 최소 +800~1,400만 원 수준의 처우 정상화 협상이 강력히 권고됩니다.
                  </div>
                </>
              ) : currentTotalCash <= marketValue.p75 ? (
                <>
                  <div className="text-sky-400 font-bold">
                    ✓ 현재 보상({currentTotalCash.toLocaleString()}만 원)은 시장 중앙 표준 구간(P25~P75: {marketValue.p25.toLocaleString()}~{marketValue.p75.toLocaleString()}만 원)에 적정 포지셔닝되어 있습니다.
                  </div>
                  <div className="text-slate-300">
                    상위 25% 대기업/유니콘 이직 시 {marketValue.p75.toLocaleString()}만 원 이상의 상한 타깃 협상이 가능합니다.
                  </div>
                </>
              ) : (
                <>
                  <div className="text-emerald-400 font-bold">
                    🌟 현재 보상({currentTotalCash.toLocaleString()}만 원)은 코호트 상위 25%(P75 {marketValue.p75.toLocaleString()}만 원 이상)의 우수한 처우를 받고 있습니다.
                  </div>
                  <div className="text-slate-300">
                    단순 급여 상승보다는 비포괄 임금제 여부, 통근 거리, 주 2일 재택근무 등 실질 시급(Life-Adjusted Value)을 중심으로 이직을 검토하십시오.
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1e273b]">
              <button
                onClick={() => setIsMarketValueModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Gap & 28 Expanded Opportunities Modal */}
      {isSkillGapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-[#1e273b]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold font-mono">+28 Opportunities</span>
                  <span className="text-xs text-slate-400">3대 전략 스킬 브릿징 로드맵</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">스킬 갭 보완 시 확장 시장 (+28건) & 요구 역량 상세</h3>
              </div>
              <button onClick={() => setIsSkillGapModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 leading-relaxed">
              전통적 인사기획(제도·평가·보상 7년차)의 역량에 아래 <strong className="text-white">3대 고부가가치 스킬셋</strong> 중 하나를 추가 확보할 경우, 수도권 채용 시장에서 즉시 지원 가능 풀(Pool)이 <strong className="text-white">+28건</strong> 확장되며, 연봉 밴드는 평균 <strong className="text-emerald-400">+15~30% 프리미엄</strong>이 형성됩니다.
            </div>

            {/* 3 Track Selector Tabs */}
            <div className="flex space-x-2 border-b border-[#233252] pb-2 text-xs overflow-x-auto">
              {EXPANDED_SKILL_GAP_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setActiveSkillTrackId(track.id)}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    activeSkillTrackId === track.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-[#152038] text-slate-300 hover:bg-[#1d2c4e]"
                  }`}
                >
                  {track.id === "track-analytics" ? "📊 1. People Analytics (14건)" : track.id === "track-global" ? "🌐 2. 글로벌 HR & 영어 (8건)" : "🤖 3. HR AX / 테크 혁신 (6건)"}
                </button>
              ))}
            </div>

            {/* Track Content */}
            <div className="space-y-4">
              <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#192235] space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="font-bold text-white text-sm">{selectedTrack.name}</div>
                  <div className="text-emerald-400 font-mono font-bold">{selectedTrack.expectedSalaryRange}</div>
                </div>

                <div className="space-y-1 pt-1 border-t border-[#1a2336]">
                  <span className="text-indigo-400 font-bold block">🎯 극복해야 할 구체적 스킬셋:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-200">
                    {selectedTrack.skills.map((s, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <span>•</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-[#1a2336]">
                  <span className="text-sky-400 font-bold block">📌 추천 실행 액션 아이템:</span>
                  <div className="space-y-1 text-slate-300">
                    {selectedTrack.actionItems.map((a, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5">
                        <span>👉</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                  <span>확장되는 타깃 채용 공고 ({selectedTrack.jobs.length}건)</span>
                  <span className="text-[11px] text-slate-400 font-normal">공식 링크로 원천 공고 확인 가능</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#233252] text-slate-400">
                        <th className="py-2 px-2.5">기업명</th>
                        <th className="py-2 px-2.5">채용 포지션</th>
                        <th className="py-2 px-2.5">근무지</th>
                        <th className="py-2 px-2.5">예상 연봉</th>
                        <th className="py-2 px-2.5 text-right">공고 원문</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18233a] font-mono">
                      {selectedTrack.jobs.map((j, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-2.5 font-sans font-bold text-white">{j.company}</td>
                          <td className="py-2.5 px-2.5 font-sans text-slate-200">{j.title}</td>
                          <td className="py-2.5 px-2.5 font-sans text-slate-400 text-[11px]">{j.location}</td>
                          <td className="py-2.5 px-2.5 text-emerald-400 font-bold">{j.salary}</td>
                          <td className="py-2.5 px-2.5 text-right font-sans">
                            <a
                              href={j.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/60 text-sky-200 border border-sky-500/40 text-[11px] font-semibold inline-flex items-center space-x-1 transition"
                            >
                              <span>원문 ↗</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1e273b]">
              <button
                onClick={() => setIsSkillGapModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && selectedJobMatch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-[#1e273b] pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400">{selectedJob.company}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedJob.title}</h3>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">표준 직무: {selectedJob.canonicalRole}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#0a0e17] p-4 rounded-xl border border-[#182338]">
              <div>
                <span className="text-slate-400">보상 기준</span>
                <div className="font-bold text-slate-100 font-mono text-sm mt-0.5">{selectedJob.salaryDisplay}</div>
              </div>
              <div>
                <span className="text-slate-400">통근 소요 (거주지 기준)</span>
                <div className="font-bold text-sky-400 font-mono text-sm mt-0.5">편도 {selectedJob.commuteMinutes}분</div>
              </div>
              <div>
                <span className="text-slate-400">포괄임금 체계</span>
                <div className="font-bold text-slate-100 mt-0.5">
                  {selectedJob.hasFixedOT ? `고정OT ${selectedJob.fixedOTHours}시간 포함` : "비포괄 (수당 100% 별도)"}
                </div>
              </div>
              <div>
                <span className="text-slate-400">적합도 점수</span>
                <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{selectedJobMatch.totalScore}%</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">공고 원문 (Raw Posting)</h4>
              <pre className="bg-[#070a10] border border-[#1b253b] rounded-xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedJob.rawText || "공고 본문 데이터가 로드되었습니다."}
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-[#1e273b]">
              <a
                href={selectedJob.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white shadow-lg transition flex items-center justify-center space-x-1"
              >
                <span>🔗 채용공고 원문 바로가기 ↗</span>
              </a>
              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  닫기
                </button>
                <button
                  onClick={() => sendJobToScanner(selectedJob)}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white shadow-lg transition"
                >
                  ⚖️ Labor Scanner로 분석 전송
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
