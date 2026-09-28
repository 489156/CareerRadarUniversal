"use client";

import React, { useState, useEffect } from "react";
import { CareerPassport, JobPosting, SalaryBenchmark } from "@/lib/types";
import { calculateLifeAdjustedHourlyWage } from "@/lib/calculator";
import { diagnoseJobRisks } from "@/lib/scanner";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"passport" | "radar" | "scanner" | "calculator" | "matrix" | "ledger">("passport");

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

  // Ledger Search & Filter
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [radarFilter, setRadarFilter] = useState<"all" | "tierA" | "highMatch" | "commuteFit">("all");

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
      alert("✅ Career Passport가 성공적으로 로컬 스토리지에 저장되었습니다!");
    } catch (e) {
      alert("저장 완료 (세션 메모리)");
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
    alert("✨ 이력서 텍스트에서 직무와 경력 연차를 추출하여 반영했습니다.");
  };

  const mockJobs: JobPosting[] = [
    {
      id: "job-1",
      company: "현대모비스 계열",
      title: "HR 전략 및 조직문화 기획 경력직",
      canonicalRole: "HR Planning & Strategy",
      location: "서울시 강남구 테헤란로 (군포에서 45분)",
      commuteMinutes: 45,
      salaryDisplay: "6,200 ~ 7,000만 원 (Tier B)",
      salaryTier: "B",
      fitScore: 94,
      hasFixedOT: true,
      fixedOTHours: 20,
      tags: ["정규직", "대기업", "수도권", "성과급별도"],
      pros: ["인사기획 5년+ 요건 완전 일치", "군포에서 통근 45분권", "동종업계 상위 연봉"],
      gaps: ["영어 프레젠테이션 역량 우대 (Gap)"],
    },
    {
      id: "job-2",
      company: "DN오토모티브",
      title: "대졸 신입/주니어 경영지원·인사",
      canonicalRole: "HR Generalist",
      location: "서울/경기 (군포에서 40분)",
      commuteMinutes: 40,
      salaryDisplay: "공고 명시 5,400만 원 (Tier A 초봉)",
      salaryTier: "A",
      fitScore: 91,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["공식연봉명시", "제조중견", "Tier A", "초봉 5400"],
      pros: ["2026 공고 명시 초봉 5,400만원 확인", "비포괄 임금 체계"],
      gaps: ["경력직 전형 처우 협상 필요"],
    },
    {
      id: "job-3",
      company: "토스 계열 핀테크",
      title: "People Partner (HRBP)",
      canonicalRole: "HR Business Partner",
      location: "서울 강남구 (군포에서 50분)",
      commuteMinutes: 50,
      salaryDisplay: "6,800 ~ 8,500만 원 + 스톡옵션 (Tier B)",
      salaryTier: "B",
      fitScore: 88,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["IT 유니콘", "주2일재택", "비포괄", "스톡옵션"],
      pros: ["비포괄 임금제 (야근수당 1.5배 정산)", "주 2일 재택근무", "실질 시급 최상위"],
      gaps: ["IT 스타트업 문화 적응도 인터뷰"],
    },
    {
      id: "job-4",
      company: "한국수출입은행 / 공공금융",
      title: "인사기획 및 노사협력 전문위원",
      canonicalRole: "HR Planning & Labor",
      location: "서울 영등포구 여의도 (군포에서 40분)",
      commuteMinutes: 40,
      salaryDisplay: "ALIO 공시 4,650만 원 (Tier A 신입초임 기준)",
      salaryTier: "A",
      fitScore: 92,
      hasFixedOT: false,
      fixedOTHours: 0,
      tags: ["공공기관", "ALIO공시", "고용안정", "퇴직금별도"],
      pros: ["ALIO 기준 확실한 복리후생 공시", "노무관리 7년 전문성 완벽 일치"],
      gaps: ["공공기관 직무급제 테이블 적용"],
    },
  ];

  const filteredJobs = mockJobs.filter((j) => {
    if (radarFilter === "tierA") return j.salaryTier === "A";
    if (radarFilter === "highMatch") return j.fitScore >= 90;
    if (radarFilter === "commuteFit") return j.commuteMinutes <= 45;
    return true;
  });

  const mockLedger: SalaryBenchmark[] = [
    { id: "1", org: "한국전력공사", role: "대졸 사무직/기획 신입", tier: "A", salary: "4,350만 원", note: "기본급 3,600 + 고정수당 750 (ALIO 공시 초임)", date: "2026-06 (공시)" },
    { id: "2", org: "국민건강보험공단", role: "행정직/인사 신입", tier: "A", salary: "4,020만 원", note: "군미필/무경력 대졸 최하위 직급 기준 (ALIO)", date: "2026-06 (공시)" },
    { id: "3", org: "DN오토모티브", role: "경영지원/인사 대졸신입", tier: "A", salary: "5,400만 원", note: "2026 상반기 공채 공고에 명시된 확정 초임", date: "2026-03 (공고)" },
    { id: "4", org: "수도권 중견 IT", role: "인사기획 5~7년차", tier: "B", salary: "5,800 ~ 6,600만 원", note: "고용노동부 사업체 임금통계 및 실오퍼 제보 집계", date: "2026-09 (제보)" },
    { id: "5", org: "현대모비스", role: "HR 전략 대리/과장", tier: "B", salary: "6,500 ~ 7,800만 원", note: "기본급 6,200 + 경영성과급 별도 (평균 15%)", date: "2026-08 (통계)" },
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
      alert("📋 블라인드/커뮤니티 공유용 텍스트가 클립보드에 복사되었습니다!\n\n" + text);
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
      alert("📋 오퍼 비교 요약이 클립보드에 복사되었습니다!\n\n" + text);
    });
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080b11]/90 border-b border-[#1b2234]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              CR
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-white">Career Radar</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Universal v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Universal Career Intelligence</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-2 overflow-x-auto py-2">
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
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
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
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-[#1d273d] pb-4">
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
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                >
                  이력서 텍스트 자동 파싱
                </button>
                <button
                  onClick={handleSavePassport}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg"
                >
                  패스포트 저장
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-indigo-400">1. 직무 및 경력</h3>
                <div>
                  <label className="text-xs text-slate-400">직무 (Role)</label>
                  <input
                    type="text"
                    value={passport.canonicalRole}
                    onChange={(e) => setPassport({ ...passport, canonicalRole: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Universal Job Ontology로 자동 정규화됩니다.</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">경력 연차: {passport.totalYears}년차</label>
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

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-indigo-400">2. 현재 보상 체계 (퇴직금 제외)</h3>
                <div>
                  <label className="text-xs text-slate-400">기본급 (연간, 만 원)</label>
                  <input
                    type="number"
                    value={passport.baseSalary}
                    onChange={(e) => setPassport({ ...passport, baseSalary: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">고정수당/식대 (연간, 만 원)</label>
                  <input
                    type="number"
                    value={passport.fixedAllowance}
                    onChange={(e) => setPassport({ ...passport, fixedAllowance: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2 text-xs font-mono text-slate-200 mt-1"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1">
                    확정 현금: {(passport.baseSalary + passport.fixedAllowance).toLocaleString()}만 원
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-indigo-400">3. 지역 및 통근</h3>
                <div>
                  <label className="text-xs text-slate-400">거주지</label>
                  <input
                    type="text"
                    value={passport.homeLocation}
                    onChange={(e) => setPassport({ ...passport, homeLocation: e.target.value })}
                    className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-2 text-xs text-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">최대 허용 편도 통근: {passport.commuteToleranceMinutes}분</label>
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
        )}

        {activeTab === "radar" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#101625] p-4 rounded-xl border border-[#1d273d]">
              <div>
                <h2 className="text-base font-bold text-white">📡 Opportunity Radar</h2>
                <p className="text-xs text-slate-400">온톨로지 매핑 및 3-Tier 연봉 검증 공고 목록</p>
              </div>
              <div className="flex space-x-2 text-xs">
                <button
                  onClick={() => setRadarFilter("all")}
                  className={`px-3 py-1.5 rounded-lg ${radarFilter === "all" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-300"}`}
                >
                  전체
                </button>
                <button
                  onClick={() => setRadarFilter("tierA")}
                  className={`px-3 py-1.5 rounded-lg ${radarFilter === "tierA" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-300"}`}
                >
                  공시/명시(Tier A)
                </button>
                <button
                  onClick={() => setRadarFilter("highMatch")}
                  className={`px-3 py-1.5 rounded-lg ${radarFilter === "highMatch" ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-300"}`}
                >
                  적합도 90%+
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-[#101625] border border-[#1d273d] rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{job.company}</span>
                      <h3 className="text-base font-bold text-white">{job.title}</h3>
                      <p className="text-[11px] text-indigo-400 font-mono mt-0.5">표준 직무: {job.canonicalRole}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-mono font-bold text-emerald-400">{job.fitScore}%</span>
                      <span className="block text-[10px] text-slate-500">FIT SCORE</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                      Tier {job.salaryTier}
                    </span>
                    <span className="font-mono text-slate-200 font-bold">{job.salaryDisplay}</span>
                    <span className="text-slate-400">| 🚗 편도 {job.commuteMinutes}분</span>
                  </div>

                  <div className="space-y-1 text-xs border-t border-[#1a2336] pt-3">
                    <div className="text-emerald-400 text-[11px]">+ 일치: {job.pros.join(", ")}</div>
                    <div className="text-amber-400 text-[11px]">- Gap: {job.gaps.join(", ")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "scanner" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">⚖️ Labor Risk & Toxic Clause Scanner</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <textarea
                  rows={10}
                  value={scannerText}
                  onChange={(e) => setScannerText(e.target.value)}
                  placeholder="공고 텍스트를 붙여넣으세요 (예: 포괄임금 연봉 5,000만 원, 수습 80% 지급 등)..."
                  className="w-full bg-[#0b0f19] border border-[#1f293d] rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleScan}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white"
                >
                  실시간 계약 리스크 진단 실행
                </button>
              </div>

              <div className="bg-[#0b0f19] border border-[#1f293d] rounded-xl p-5">
                {scanResult ? (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-rose-400">진단 결과 ({scanResult.warnings.length}건 위험 감지)</span>
                    {scanResult.warnings.map((w, idx) => (
                      <div key={idx} className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-rose-400">{w.title}</div>
                        <div className="text-[11px] text-slate-300">{w.desc}</div>
                      </div>
                    ))}
                    {scanResult.isClean && (
                      <div className="text-emerald-400 text-xs font-bold">✅ 깨끗한 정규직 공고 조건입니다.</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 py-12 text-xs">공고 본문을 입력하고 진단을 실행하세요.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "calculator" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">💰 실질 체감 시급 계산기</h2>
                <button
                  onClick={copyCalculatorText}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-semibold border border-slate-700"
                >
                  공유용 텍스트 복사
                </button>
              </div>
              <div>
                <label className="text-xs text-slate-300">확정 연간 현금: {calcInput.cashManwon.toLocaleString()}만 원</label>
                <input
                  type="range"
                  min="3000"
                  max="15000"
                  step="100"
                  value={calcInput.cashManwon}
                  onChange={(e) => setCalcInput({ ...calcInput, cashManwon: parseInt(e.target.value) || 0 })}
                  className="w-full accent-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">편도 통근 시간: {calcInput.commuteMinutesOneway}분</label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={calcInput.commuteMinutesOneway}
                  onChange={(e) => setCalcInput({ ...calcInput, commuteMinutesOneway: parseInt(e.target.value) || 0 })}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">주당 실근로시간: {calcInput.weeklyWorkHours}시간</label>
                <input
                  type="range"
                  min="40"
                  max="68"
                  step="2"
                  value={calcInput.weeklyWorkHours}
                  onChange={(e) => setCalcInput({ ...calcInput, weeklyWorkHours: parseInt(e.target.value) || 40 })}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#1f293d] rounded-xl p-6 space-y-4">
              <span className="text-xs text-slate-400">실질 체감 시급 (Life-Adjusted)</span>
              <div className="text-3xl font-mono font-bold text-emerald-400">{calcResult.realHourlyWage.toLocaleString()}원</div>
              <p className="text-xs text-slate-400">단순 명목 시급: {calcResult.nominalHourlyWage.toLocaleString()}원</p>
              <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                {calcResult.utilityVerdictText}
              </div>
            </div>
          </div>
        )}

        {activeTab === "matrix" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">📊 Offer Comparison Matrix</h2>
              <button
                onClick={copyOfferText}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-semibold border border-slate-700"
              >
                오퍼 비교 요약 복사
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1f293d] text-slate-400">
                    <th className="py-2">항목</th>
                    <th className="py-2">현재 직장</th>
                    <th className="py-2 text-indigo-400">Offer A (대기업)</th>
                    <th className="py-2 text-emerald-400">Offer B (테크 핀테크)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#182030] font-mono">
                  <tr>
                    <td className="py-3 font-sans text-slate-300">확정 기본급</td>
                    <td>5,400만 원</td>
                    <td className="text-indigo-400">6,200만 원 (+800)</td>
                    <td className="text-emerald-400">5,800만 원 (+400)</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans text-slate-300">편도 통근 시간</td>
                    <td>35분</td>
                    <td className="text-rose-400">75분 ⚠️</td>
                    <td className="text-emerald-400">40분</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-sans text-slate-300">실질 체감 시급</td>
                    <td>22,350원</td>
                    <td className="text-rose-400">19,820원 (-11.3%) 📉</td>
                    <td className="text-emerald-400 font-bold">26,450원 (+18.3%) 🚀</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="bg-[#101625] border border-[#1d273d] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">🏛️ 3-Tier Evidence-Backed Salary Ledger</h2>
              <input
                type="text"
                placeholder="검색어 입력..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="bg-[#0b0f19] border border-[#1f293d] rounded-xl px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1f293d] text-slate-400">
                  <th className="py-2">기관/기업</th>
                  <th className="py-2">직무</th>
                  <th className="py-2">증거 등급</th>
                  <th className="py-2">명시 연봉</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#182030] font-mono">
                {filteredLedger.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-sans font-bold text-white">{row.org}</td>
                    <td className="py-3 font-sans text-slate-300">{row.role}</td>
                    <td className="py-3 text-emerald-400 font-bold">Tier {row.tier}</td>
                    <td className="py-3 text-slate-200">{row.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#1e273b] rounded-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#1e273b] pb-3">
              <h3 className="font-bold text-white text-base">📄 이력서 / 경력기술서 빠른 파싱</h3>
              <button onClick={() => setIsResumeModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="이력서나 경력기술서 텍스트를 붙여넣으세요..."
              className="w-full bg-[#0a0d14] border border-[#1f293d] rounded-xl p-3 text-xs font-mono text-slate-200"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsResumeModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs">취소</button>
              <button onClick={handleResumeExtract} className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-xs text-white">자동 추출 적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
