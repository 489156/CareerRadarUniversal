import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CRAWLER_SOURCES, getCrawlerNetworkStats } from '@/lib/crawler';

export function CrawlerModal() {
  const isCrawlerModalOpen = useAppStore((s) => s.isCrawlerModalOpen);
  const setIsCrawlerModalOpen = useAppStore((s) => s.setIsCrawlerModalOpen);
  const crawlerCategoryFilter = useAppStore((s) => s.crawlerCategoryFilter);
  const setCrawlerCategoryFilter = useAppStore((s) => s.setCrawlerCategoryFilter);

  if (!isCrawlerModalOpen) return null;

  const stats = getCrawlerNetworkStats();
  const countByCat = (cat: string) =>
    cat === "ALL"
      ? CRAWLER_SOURCES.length
      : CRAWLER_SOURCES.filter((s) => s.category === cat).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCrawlerModalOpen(false);
      }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-3 border-b border-[#1e273b]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                {stats.totalSources} TARGET CHANNELS
              </span>
              <span className="text-xs text-slate-400">일일 크롤링 3개 핵심망(ALIO·PwC·Deloitte) + 자사 채용관 인덱스</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              🌐 Universal Multi-Source Crawler Network (자체 ATS 수집·연동망)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCrawlerModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-slate-900/60 border border-indigo-500/30 rounded-xl space-y-2 text-xs leading-relaxed">
          <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
            <span>🛡️ CareerRadar 수집 파이프라인 범위 안내:</span>
          </div>
          <p className="text-slate-300">
            GitHub Actions 일일 무인 크롤러는 <strong>ALIO 공공기관 공시망, 삼일PwC, 딜로이트 안진</strong>의 실제 채용 공고를 매일 스크래핑하며, 나머지 대기업·유니콘·외국계 채널({stats.totalSources - 3}곳)은 공식 채용관 링크를 연결한 큐레이션 데이터셋으로 통합 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
            <span className="text-[11px] text-slate-400">연동 도메인 목록</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{stats.totalSources}개 공식 채널</div>
            <span className="text-[10px] text-slate-500">실시간 스크래핑 3 + 공식 ATS 디렉터리 {stats.totalSources - 3}</span>
          </div>
          <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
            <span className="text-[11px] text-slate-400">자사 사이트 단독 공고 비율</span>
            <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{stats.exclusiveCompanyRatio}% 독점</div>
            <span className="text-[10px] text-slate-500">대형 유료 잡포털 미노출 비중</span>
          </div>
          <div className="bg-[#0a0e17] p-3.5 rounded-xl border border-[#192235]">
            <span className="text-[11px] text-slate-400">자동 수집 스케줄</span>
            <div className="text-xl font-bold font-mono text-sky-400 mt-1">매일 09:00 KST</div>
            <span className="text-[10px] text-slate-500">GitHub Actions + Supabase Upsert</span>
          </div>
        </div>

        <div className="flex space-x-2 border-b border-[#233252] pb-2 text-xs overflow-x-auto">
          {[
            { id: "ALL", label: `전체 (${countByCat("ALL")}곳)` },
            { id: "CONSULTING", label: `💼 회계·컨설팅 (${countByCat("CONSULTING")}곳)` },
            { id: "PUBLIC", label: `🏛️ 공공·국책금융 (${countByCat("PUBLIC")}곳)` },
            { id: "CONGLOMERATE", label: `🏭 대기업 (${countByCat("CONGLOMERATE")}곳)` },
            { id: "GLOBAL_TECH", label: `🌐 글로벌 테크 (${countByCat("GLOBAL_TECH")}곳)` },
            { id: "AGGREGATOR", label: `🔗 어그리게이터 (${countByCat("AGGREGATOR")}곳)` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#233252] text-slate-400">
                <th className="py-2.5 px-3">수집원 / 채용 시스템명</th>
                <th className="py-2.5 px-3">공식 타깃 도메인</th>
                <th className="py-2.5 px-3">연동 방식</th>
                <th className="py-2.5 px-3 text-right">수집 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18233a] font-mono">
              {CRAWLER_SOURCES.filter(
                (s) => crawlerCategoryFilter === "ALL" || s.category === crawlerCategoryFilter
              ).map((s) => {
                const isLiveScraper = s.id === "source-alio" || s.id === "source-pwc" || s.id === "source-deloitte";
                return (
                  <tr key={s.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white text-xs">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{s.description}</div>
                    </td>
                    <td className="py-3 px-3 text-sky-400">
                      <a
                        href={`https://${s.targetDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {s.targetDomain} ↗
                      </a>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {isLiveScraper ? "자동 일일 스크래퍼" : "공식 채용관 큐레이션"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isLiveScraper
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-sky-500/20 text-sky-400 border-sky-500/30"
                        }`}
                      >
                        {isLiveScraper ? "● LIVE 크롤링" : "◎ 공식 링크 연동"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1e273b]">
          <button
            type="button"
            onClick={() => setIsCrawlerModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}
