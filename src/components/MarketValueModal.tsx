import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateEstimatedMarketValue, mapCompanyTypeToTier } from '@/lib/matcher';
import { IconClose } from './Icons';

export function MarketValueModal() {
  const isMarketValueModalOpen = useAppStore((s) => s.isMarketValueModalOpen);
  const setIsMarketValueModalOpen = useAppStore((s) => s.setIsMarketValueModalOpen);
  const passport = useAppStore((s) => s.passport);

  if (!isMarketValueModalOpen) return null;

  const marketValue = calculateEstimatedMarketValue(
    `${passport.canonicalRole} ${passport.occupation}`,
    passport.totalYears,
    passport.track,
    mapCompanyTypeToTier(passport.companyType)
  );
  const currentTotalCash = passport.baseSalary + passport.fixedAllowance;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsMarketValueModalOpen(false);
      }}
    >
      <div className="bg-[#111113] border border-white/[0.1] rounded-[12px] max-w-2xl w-full p-5 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
              <span>{marketValue.confidenceTier}</span>
              <span>·</span>
              <span className="tabular-nums">n={marketValue.sampleSize}</span>
            </div>
            <h3 className="text-base font-semibold text-zinc-100 mt-1 tracking-[-0.02em]">
              내 시장 가치 추정 (P25–P75) 산출 근거
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsMarketValueModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors duration-150"
          >
            <IconClose />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#18181B] p-3.5 rounded-[8px] border border-white/[0.08] text-xs">
          <div>
            <span className="text-[11px] text-zinc-500 block">직군</span>
            <span className="text-zinc-200 font-medium">{marketValue.domainName}</span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block">설정 직무</span>
            <span className="text-zinc-200 font-medium truncate block">{passport.canonicalRole || passport.occupation}</span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block">경력 구간</span>
            <span className="text-zinc-100 font-mono tabular-nums font-medium">
              {passport.track === "ENTRY" || passport.totalYears === 0 ? "0년차 (신입)" : `${passport.totalYears}년차`}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-zinc-500 block">목표 기업군</span>
            <span className="text-zinc-200 font-medium">{marketValue.tierDesc}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-300">합성 가중치 모델 (퇴직금·변동 성과급 제외)</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-3 bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] space-y-1">
              <div className="font-mono text-[11px] text-zinc-200 font-semibold">Tier A ({marketValue.methodology.tierAWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-zinc-400">{marketValue.methodology.tierAWeight}</div>
            </div>
            <div className="p-3 bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] space-y-1">
              <div className="font-mono text-[11px] text-zinc-200 font-semibold">Tier B ({marketValue.methodology.tierBWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-zinc-400">{marketValue.methodology.tierBWeight}</div>
            </div>
            <div className="p-3 bg-[#0A0A0B] border border-white/[0.08] rounded-[8px] space-y-1">
              <div className="font-mono text-[11px] text-zinc-200 font-semibold">Tier C ({marketValue.methodology.tierCWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-zinc-400">{marketValue.methodology.tierCWeight}</div>
            </div>
          </div>
        </div>

        <div className="border border-white/[0.08] rounded-[8px] overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] border-b border-white/[0.08] text-zinc-400">
              <tr>
                <th className="py-2 px-3 font-medium whitespace-nowrap">분위수</th>
                <th className="py-2 px-3 font-medium whitespace-nowrap">추정 연봉</th>
                <th className="py-2 px-3 font-medium whitespace-nowrap">시장 포지션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono tabular-nums">
              {[
                { label: "P10 (하위 10%)", val: marketValue.p10, desc: "해당 기업군 내 보수 하한선", strong: false },
                { label: "P25 (하위 25%)", val: marketValue.p25, desc: "표준 오퍼 권고 하한", strong: true },
                { label: "P50 (중앙값)", val: marketValue.p50, desc: "동일 직군·연차·Tier 중앙값", strong: true },
                { label: "P75 (상위 25%)", val: marketValue.p75, desc: "핵심 역량 보유 시 타깃 상한", strong: true },
                { label: "P90 (상위 10%)", val: marketValue.p90, desc: "상위 선도 기업 핵심 인재 구간", strong: false },
              ].map((row) => (
                <tr key={row.label} className={row.strong ? "bg-[#18181B]/40" : ""}>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">{row.label}</td>
                  <td className={`py-2.5 px-3 font-semibold ${row.strong ? "text-zinc-100" : "text-zinc-300"}`}>
                    {row.val.toLocaleString()}만 원
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 font-sans">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#18181B] rounded-[8px] border border-white/[0.08] text-xs space-y-1">
          {passport.track === "ENTRY" || currentTotalCash === 0 ? (
            <>
              <div className="text-zinc-100 font-medium">신입/인턴 트랙 타깃 초임: {marketValue.p25.toLocaleString()} ~ {marketValue.p75.toLocaleString()}만 원</div>
              <div className="text-zinc-400">{marketValue.tierDesc} 기준 중앙값은 {marketValue.p50.toLocaleString()}만 원입니다.</div>
            </>
          ) : currentTotalCash < marketValue.p25 ? (
            <>
              <div className="text-rose-400 font-medium">현재 보상({currentTotalCash.toLocaleString()}만 원)이 코호트 P25({marketValue.p25.toLocaleString()}만 원) 미만입니다.</div>
              <div className="text-zinc-400">이직 시 중앙값({marketValue.p50.toLocaleString()}만 원) 수준으로 처우 정상화 협상을 검토하십시오.</div>
            </>
          ) : currentTotalCash <= marketValue.p75 ? (
            <>
              <div className="text-zinc-100 font-medium">현재 보상({currentTotalCash.toLocaleString()}만 원)이 시장 표준 구간(P25–P75) 내에 있습니다.</div>
              <div className="text-zinc-400">상위 포지션 이동 시 {marketValue.p75.toLocaleString()}만 원 이상 상향 협상이 가능합니다.</div>
            </>
          ) : (
            <>
              <div className="text-emerald-400 font-medium">현재 보상({currentTotalCash.toLocaleString()}만 원)이 코호트 상위 25%(P75) 이상입니다.</div>
              <div className="text-zinc-400">단순 연봉 외 비포괄 여부·통근·재택 등 [4. 실질 시급] 중심으로 비교하십시오.</div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setIsMarketValueModalOpen(false)}
            className="px-4 py-2 rounded-[6px] bg-[#FAFAFA] hover:bg-white text-xs font-semibold text-[#0A0A0B] transition-colors duration-150"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
