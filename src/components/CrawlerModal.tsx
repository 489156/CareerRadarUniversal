import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CRAWLER_SOURCES, getCrawlerNetworkStats } from '@/lib/crawler';

export function CrawlerModal() {
  const isCrawlerModalOpen = useAppStore(state => state.isCrawlerModalOpen);
  const setIsCrawlerModalOpen = useAppStore(state => state.setIsCrawlerModalOpen);
  const crawlerCategoryFilter = useAppStore(state => state.crawlerCategoryFilter);
  const setCrawlerCategoryFilter = useAppStore(state => state.setCrawlerCategoryFilter);

  if (!isCrawlerModalOpen) return null;

  return (
    <>
      {/* Universal Multi-Source Crawler Network Modal */}
      
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsCrawlerModalOpen(false); }}
        >
          <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-[#1e273b]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                    18 ACTIVE CHANNELS
                  </span>
                  <span className="text-xs text-slate-400">자사 채용사이트 및 공공공시 전수 크롤러</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  🌐 Universal Multi-Source Crawler Network (자체 ATS 통합 수집망)
                </h3>
              </div>
              <button
                onClick={() => setIsCrawlerModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Strategic Moat Context Box */}
            <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-xl space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                <span>🛡️ CareerRadar 기술적 해자(Technological Moat) 및 개발 취지:</span>
              </div>
              <p className="text-slate-300">
                대기업, Big4 회계법인, 글로벌 전략 컨설팅(MBB), 공공기관 및 외국계 유니콘은 핵심 경력직 채용 공고를 <strong>사람인/잡코리아 등 국내 대형 유료 잡포털에 노출하지 않고</strong>, <strong>자사 홈페이지 독자 채용 시스템(WiseRecruit2, Workday, Greenhouse, Taleo) 및 ALIO 공시망에만 단독 게재</strong>합니다.
              </p>
              <p className="text-indigo-200">
                구직자가 수십 개 사이트를 매일 즐겨찾기하고 직접 방문해야 하는 비효율을 완전히 제거하기 위해, 본 시스템은 아래 <strong>18개 핵심 채용 전산망을 24/7 실시간 크롤링하여 온톨로지 기반으로 표준화 매칭</strong>합니다.
              </p>
            </div>

            {/* Top 3 KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
                <span className="text-[11px] text-slate-400">연동 수집 도메인</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">18개 시스템 LIVE</div>
                <span className="text-[10px] text-slate-500">Big4, MBB, ALIO, 삼성, SK, 현대차, AWS</span>
              </div>
              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
                <span className="text-[11px] text-slate-400">자사 사이트 단독 공고 비율</span>
                <div className="text-xl font-bold font-mono text-indigo-400 mt-1">68.4% 독점 커버리지</div>
                <span className="text-[10px] text-slate-500">일반 대형 잡포털 미노출 포지션</span>
              </div>
              <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
                <span className="text-[11px] text-slate-400">엔진 동기화 주기</span>
                <div className="text-xl font-bold font-mono text-sky-400 mt-1">15~30분 주기</div>
                <span className="text-[10px] text-slate-500">24/7 무중단 백그라운드 파이프라인</span>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex space-x-2 border-b border-[#233252] pb-2 text-xs overflow-x-auto">
              {[
                { id: "ALL", label: "전체 수집망 (18곳)" },
                { id: "CONSULTING", label: "💼 회계·전략컨설팅 (7곳)" },
                { id: "PUBLIC", label: "🏛️ 공공기관 / 국책금융 (5곳)" },
                { id: "CONGLOMERATE", label: "🏭 대기업 자사채용 (4곳)" },
                { id: "GLOBAL_TECH", label: "🌐 글로벌 테크 (3곳)" },
                { id: "AGGREGATOR", label: "🔗 글로벌 어그리게이터 (2곳)" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCrawlerCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    crawlerCategoryFilter === tab.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-[#152038] text-slate-300 hover:bg-[#1d2c4e]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Source List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#233252] text-slate-400">
                    <th className="py-2.5 px-3">수집원 / 채용 시스템명</th>
                    <th className="py-2.5 px-3">수집 타깃 도메인</th>
                    <th className="py-2.5 px-3">연동 방식</th>
                    <th className="py-2.5 px-3">크롤링 주기</th>
                    <th className="py-2.5 px-3">인덱싱 현황</th>
                    <th className="py-2.5 px-3 text-right">수집 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18233a] font-mono">
                  {CRAWLER_SOURCES.filter(
                    (s) => crawlerCategoryFilter === "ALL" || s.category === crawlerCategoryFilter
                  ).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white text-xs">{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">{s.description}</div>
                      </td>
                      <td className="py-3 px-3 text-sky-400">
                        <a href={`https://${s.targetDomain.split('/')[0]}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {s.targetDomain} ↗
                        </a>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {s.sourceType === "PROPRIETARY_ATS" ? "독자 ATS 크롤러" : s.sourceType === "PUBLIC_API" ? "공공 API 연동" : s.sourceType === "ENTERPRISE_WORKDAY" ? "Workday/클라우드" : "글로벌 스크래퍼"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">{s.crawlFrequency}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">{s.indexedCount}건 색인</td>
                      <td className="py-3 px-3 text-right font-sans">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ● {s.status} ({s.lastSyncMinutesAgo}분 전)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1e273b]">
              <button
                onClick={() => setIsCrawlerModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>

    </>
  );
}
