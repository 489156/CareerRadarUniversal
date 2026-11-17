import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateEstimatedMarketValue, mapCompanyTypeToTier } from '@/lib/matcher';

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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsMarketValueModalOpen(false);
      }}
    >
      <div className="bg-[#111726] border border-[#233252] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-[#1e273b] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold">
                통계 및 산출 공식
              </span>
              <span className="text-xs text-slate-400">다차원 코호트 3-Tier 추정 엔진</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">내 시장 가치 추정 (P25 ~ P75) 산출 근거</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsMarketValueModalOpen(false)}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="bg-[#0a0e17] p-4 rounded-xl border border-[#192235] space-y-2 text-xs">
          <div className="text-indigo-400 font-bold uppercase tracking-wider">1. 타깃 코호트 정의 (Cohort Granularity)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 pt-1">
            <div>
              <span className="text-slate-500 block">직군</span> {marketValue.domainName}
            </div>
            <div>
              <span className="text-slate-500 block">설정 직무</span> {passport.canonicalRole || passport.occupation}
            </div>
            <div>
              <span className="text-slate-500 block">경력 구간</span>{" "}
              <span className="text-emerald-400 font-bold">
                {passport.track === "ENTRY" || passport.totalYears === 0
                  ? "0년차 (신입/인턴)"
                  : `${passport.totalYears}년차`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">목표 기업군</span> {marketValue.tierDesc}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-white flex items-center space-x-2">
            <span>2. 3-Tier 증거 기반 합성 가중치</span>
            <span className="text-[10px] text-slate-400 font-normal">(신뢰도 순차 결합)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-sans">
            <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
              <div className="font-bold text-emerald-400">Tier A ({marketValue.methodology.tierAWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-slate-300">
                {marketValue.methodology.tierAWeight} · 공공기관(ALIO)/상장사(DART) 공시 기준
              </div>
            </div>
            <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
              <div className="font-bold text-sky-400">Tier B ({marketValue.methodology.tierBWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-slate-300">
                {marketValue.methodology.tierBWeight} (표본 n={marketValue.sampleSize}건 정규화)
              </div>
            </div>
            <div className="p-3 bg-[#0c101c] border border-[#1c2842] rounded-xl space-y-1">
              <div className="font-bold text-amber-400">Tier C ({marketValue.methodology.tierCWeight.split(" ")[0]})</div>
              <div className="text-[11px] text-slate-300">
                {marketValue.methodology.tierCWeight} (상·하위 5% 극단치 절사 보정)
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-bold text-white">
            3. 코호트 임금 분포표 ({marketValue.methodology.baseScope})
          </div>
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
                  <td className="py-2.5 px-2 text-slate-400 font-sans">해당 직군·기업 Tier 내 보수 하한선</td>
                </tr>
                <tr className="bg-indigo-950/20 font-bold">
                  <td className="py-2.5 px-2 text-indigo-400">P25 (하위 25%)</td>
                  <td className="py-2.5 px-2 text-indigo-300">{marketValue.p25.toLocaleString()}만 원</td>
                  <td className="py-2.5 px-2 text-indigo-200 font-sans">일반 표준 오퍼 권고 하한</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2.5 px-2 text-sky-400">P50 (중앙값)</td>
                  <td className="py-2.5 px-2 text-white">{marketValue.p50.toLocaleString()}만 원</td>
                  <td className="py-2.5 px-2 text-slate-200 font-sans">동일 직군·연차·기업 Tier 중앙값</td>
                </tr>
                <tr className="bg-emerald-950/20 font-bold">
                  <td className="py-2.5 px-2 text-emerald-400">P75 (상위 25%)</td>
                  <td className="py-2.5 px-2 text-emerald-300">{marketValue.p75.toLocaleString()}만 원</td>
                  <td className="py-2.5 px-2 text-emerald-200 font-sans">핵심 스킬 보유·핵심인재 협상 타깃</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2 text-purple-400 font-bold">P90 (상위 10%)</td>
                  <td className="py-2.5 px-2 text-purple-300 font-bold">{marketValue.p90.toLocaleString()}만 원</td>
                  <td className="py-2.5 px-2 text-slate-400 font-sans">상위 선도 기업 핵심 포지션 상한</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3.5 bg-[#0a0e17] rounded-xl border border-[#1d273d] text-xs space-y-1">
          {passport.track === "ENTRY" || currentTotalCash === 0 ? (
            <>
              <div className="text-sky-400 font-bold">
                🎓 신입/인턴 트랙 타깃 초임 기준: {marketValue.p25.toLocaleString()} ~ {marketValue.p75.toLocaleString()}만 원
              </div>
              <div className="text-slate-300">
                {marketValue.tierDesc} 기준 대졸 초임 중앙값은 {marketValue.p50.toLocaleString()}만 원입니다.
              </div>
            </>
          ) : currentTotalCash < marketValue.p25 ? (
            <>
              <div className="text-rose-400 font-bold">
                ⚠️ 현재 보상({currentTotalCash.toLocaleString()}만 원)은 코호트 하위 25% 미만(P25 {marketValue.p25.toLocaleString()}만 원)에 위치합니다.
              </div>
              <div className="text-slate-300">
                동종 직군·연차 대비 저평가 구간이며, 이직 시 P50({marketValue.p50.toLocaleString()}만 원) 수준으로 처우 정상화 협상을 권장합니다.
              </div>
            </>
          ) : currentTotalCash <= marketValue.p75 ? (
            <>
              <div className="text-sky-400 font-bold">
                ✓ 현재 보상({currentTotalCash.toLocaleString()}만 원)은 시장 표준 구간(P25~P75)에 포지셔닝되어 있습니다.
              </div>
              <div className="text-slate-300">
                스킬 갭 보완 및 상위 Tier 이동 시 {marketValue.p75.toLocaleString()}만 원 이상 상향 협상이 가능합니다.
              </div>
            </>
          ) : (
            <>
              <div className="text-emerald-400 font-bold">
                🌟 현재 보상({currentTotalCash.toLocaleString()}만 원)은 코호트 상위 25%(P75 {marketValue.p75.toLocaleString()}만 원 이상) 수준입니다.
              </div>
              <div className="text-slate-300">
                단순 연봉보다는 비포괄 임금제, 통근 거리, 재택 등 [4. 실질 체감 시급] 개선 중심으로 이직을 검토하십시오.
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1e273b]">
          <button
            type="button"
            onClick={() => setIsMarketValueModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
}
