import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { calculateEstimatedMarketValue } from '@/lib/matcher';
import { calculateLifeAdjustedHourlyWage } from '@/lib/calculator';

export function MarketValueModal() {
  const isMarketValueModalOpen = useAppStore(state => state.isMarketValueModalOpen);
  const setIsMarketValueModalOpen = useAppStore(state => state.setIsMarketValueModalOpen);
  const passport = useAppStore(state => state.passport);

  const marketValue = calculateEstimatedMarketValue(passport.canonicalRole, passport.totalYears, passport.track);
  const currentTotalCash = passport.baseSalary + passport.fixedAllowance + passport.variableBonus;

  return (
    <>
      {/* Market Value Methodology Modal */}
      {isMarketValueModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setIsMarketValueModalOpen(false); }}
        >
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

    </>
  );
}
