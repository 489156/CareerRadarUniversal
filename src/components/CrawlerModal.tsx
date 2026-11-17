import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CRAWLER_SOURCES, getCrawlerNetworkStats } from '@/lib/crawler';
import { IconClose, IconExternal } from './Icons';

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
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCrawlerModalOpen(false);
      }}
    >
      <div className="bg-[#111113] border border-white/[0.1] rounded-[12px] max-w-4xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
              <span>{stats.totalSources} CHANNELS</span>
              <span>·</span>
              <span>LIVE SCRAPER 3 + OFFICIAL ATS {stats.totalSources - 3}</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-1 tracking-[-0.02em]">
              자체 ATS 수집 및 공식 채용관 네트워크
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsCrawlerModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150"
          >
            <IconClose />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 bg-[#18181B] border border-white/[0.08] rounded-[8px] divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] text-xs">
          <div className="p-3">
            <span className="text-[11px] text-zinc-400">전체 채널</span>
            <div className="text-lg font-semibold font-mono tabular-nums text-zinc-100 mt-0.5">{stats.totalSources}개</div>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-zinc-400">잡포털 미노출 단독 공고</span>
            <div className="text-lg font-semibold font-mono tabular-nums text-zinc-100 mt-0.5">{stats.exclusiveCompanyRatio}%</div>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-zinc-400">일일 크롤링 주기</span>
            <div className="text-lg font-semibold font-mono tabular-nums text-zinc-100 mt-0.5">09:00 KST</div>
          </div>
        </div>

        <div className="flex space-x-1.5 border-b border-white/[0.08] pb-2.5 text-xs overflow-x-auto">
          {[
            { id: "ALL", label: `전체 (${countByCat("ALL")})` },
            { id: "CONSULTING", label: `회계·컨설팅 (${countByCat("CONSULTING")})` },
            { id: "PUBLIC", label: `공공·국책금융 (${countByCat("PUBLIC")})` },
            { id: "CONGLOMERATE", label: `대기업 (${countByCat("CONGLOMERATE")})` },
            { id: "GLOBAL_TECH", label: `글로벌 테크 (${countByCat("GLOBAL_TECH")})` },
            { id: "AGGREGATOR", label: `어그리게이터 (${countByCat("AGGREGATOR")})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCrawlerCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-[6px] font-medium transition-colors duration-150 whitespace-nowrap ${
                crawlerCategoryFilter === tab.id
                  ? "bg-[#FAFAFA] text-[#0A0A0B]"
                  : "bg-[#18181B] text-zinc-300 hover:bg-[#222226] border border-white/[0.08]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="border border-white/[0.08] rounded-[8px] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
              <tr>
                <th className="py-2 px-3 font-medium whitespace-nowrap">수집원</th>
                <th className="py-2 px-3 font-medium whitespace-nowrap">타깃 도메인</th>
                <th className="py-2 px-3 font-medium whitespace-nowrap">연동 방식</th>
                <th className="py-2 px-3 text-right font-medium whitespace-nowrap">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {CRAWLER_SOURCES.filter(
                (s) => crawlerCategoryFilter === "ALL" || s.category === crawlerCategoryFilter
              ).map((s) => {
                const isLiveScraper = s.id === "source-alio" || s.id === "source-pwc" || s.id === "source-deloitte";
                return (
                  <tr key={s.id} className="hover:bg-[#18181B]/60 transition-colors duration-150">
                    <td className="py-2.5 px-3 min-w-[140px]">
                      <div className="font-medium text-zinc-100">{s.name}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{s.description}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-300 whitespace-nowrap">
                      <a
                        href={`https://${s.targetDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 hover:text-white underline decoration-zinc-700"
                      >
                        <span className="truncate max-w-[200px]">{s.targetDomain}</span>
                        <IconExternal className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                      {isLiveScraper ? "자동 스크래퍼" : "공식 채용관"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[6px] text-[10px] font-medium border ${
                          isLiveScraper
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-800/80 text-zinc-300 border-white/[0.08]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isLiveScraper ? "bg-emerald-400" : "bg-zinc-400"}`} />
                        <span>{isLiveScraper ? "LIVE" : "연동됨"}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setIsCrawlerModalOpen(false)}
            className="px-4 py-2 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
