import { LifeAdjustedInput, LifeAdjustedOutput } from "./types";

export function calculateLifeAdjustedHourlyWage(input: LifeAdjustedInput): LifeAdjustedOutput {
  // Input validation & fallback to prevent NaN or divide-by-zero
  const cashManwon = Math.max(0, input.cashManwon || 0);
  const monthlyTransitCost = Math.max(0, input.monthlyTransitCostManwon || 0);
  const commuteMins = Math.max(0, input.commuteMinutesOneway || 0);
  const remoteDays = Math.min(5, Math.max(0, input.weeklyRemoteDays || 0));
  const weeklyHours = Math.max(1, input.weeklyWorkHours || 40);

  const annualCashWon = cashManwon * 10000;
  const annualTransitCostWon = monthlyTransitCost * 12 * 10000;

  // 주당 출근 일수 (5일 중 재택 일수 차감)
  const commuteDaysPerWeek = Math.max(0, 5 - remoteDays);

  // 연간 통근 시간 (52주 기준, 왕복)
  const weeklyCommuteHours = (commuteMins * 2 * commuteDaysPerWeek) / 60;
  const annualCommuteHours = Math.round(weeklyCommuteHours * 52);

  // 연간 실근로시간 (52주 기준)
  const annualWorkHours = weeklyHours * 52;
  const totalLifeHoursInvested = Math.max(1, annualWorkHours + annualCommuteHours);

  // 1. 단순 명목 시급 (주 40시간 연 2,088시간 기준)
  const nominalHourlyWage = Math.round(annualCashWon / 2088);

  // 2. 실질 체감 시급 (순수 경제적 혜택 / 총 삶의 투입 시간)
  const netEconomicBenefitWon = Math.max(0, annualCashWon - annualTransitCostWon);
  const realHourlyWage = Math.round(netEconomicBenefitWon / totalLifeHoursInvested);

  // 3. 통근 절감 및 효용 인사이트
  const halfCommuteSaveHours = Math.round((weeklyCommuteHours / 2) * 52);
  const equivalentWageIncrease = Math.round((halfCommuteSaveHours * realHourlyWage) / 10000);

  const utilityVerdictText = halfCommuteSaveHours > 0
    ? `편도 통근 시간을 절반으로 줄일 경우 연간 약 ${halfCommuteSaveHours}시간(약 ${(halfCommuteSaveHours/24).toFixed(1)}일)의 여유 시간이 확보되어, 연봉 약 ${equivalentWageIncrease}만 원 인상과 대등한 삶의 효용이 발생합니다.`
    : `전면 재택 또는 통근 시간 제로 환경으로, 이동에 따른 시간/비용 누수가 완전히 차단된 이상적인 조건입니다.`;

  return {
    nominalHourlyWage,
    realHourlyWage,
    annualCommuteHours,
    annualCommuteCostWon: annualTransitCostWon,
    totalLifeHoursInvested,
    utilityVerdictText,
  };
}
