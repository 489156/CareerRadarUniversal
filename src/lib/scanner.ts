import { LaborRiskDiagnosis, LaborRiskWarning } from "./types";

export function diagnoseJobRisks(text: string): LaborRiskDiagnosis {
  const warnings: LaborRiskWarning[] = [];
  const normalizedText = (text || "").replace(/\s+/g, " ");

  // "비포괄임금", "포괄임금제 폐지/미적용/없음" 같은 정상 조건 문구를 먼저 제거한 뒤 고정OT 탐지
  const otCheckText = normalizedText
    .replace(/비\s*포괄\s*(?:임금(?:제)?|OT)?\S*/gi, " ")
    .replace(/(?:포괄\s*임금(?:제)?|고정\s*(?:연장|OT))\S*\s*(?:폐지|미적용|없음|아니[며고]|제외|별도\s*지급)/gi, " ");

  // 1. 포괄임금제 / 고정OT 감지
  const otMatch = otCheckText.match(/(포괄임금|고정연장|고정\s*OT|시간외수당\s*\d+\s*시간|연장근로수당\s*포함)/i);
  let isFixedOT = false;
  let fixedOTHours = 0;

  if (otMatch) {
    isFixedOT = true;
    const hoursMatch =
      otCheckText.match(/(\d+)\s*(?:시간|h)\s*(?:포괄|포함|인정|산입|고정)/i) ||
      otCheckText.match(/(?:포괄|고정\s*OT|고정연장|시간외수당)\D{0,10}(\d+)\s*(?:시간|h)/i);
    fixedOTHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 32; // 시간 미명시 시 업계 평균 32시간 가정
    warnings.push({
      type: "danger",
      title: `🚨 포괄임금제 (월 고정 OT 약 ${fixedOTHours}시간 포함) 감지`,
      desc: `월 ${fixedOTHours}시간의 시간외근로수당이 기본급에 사전 산입되어 있어, 실제 야근이 잦더라도 추가 수당이 발생하지 않습니다. 주 40시간 기준 순수 기본급을 역산하여 비교해야 합니다.`,
    });
  }

  // 2. 퇴직금 분할 지급 (1/13 분할) 감지 (단, 정상 퇴직연금 DC/DB 적립은 예외)
  const isNormalPension = /퇴직연금.*(DC|DB|적립|가입)/i.test(normalizedText) && !/1\/13|분할|월할/i.test(normalizedText);
  if (!isNormalPension && /퇴직금[^.!?\n]{0,20}(포함|1\/13|월할|분할)|연봉의\s*1\/13/i.test(normalizedText)) {
    warnings.push({
      type: "danger",
      title: "⚠️ 퇴직금 1/13 분할 지급 의심 (근로기준법 위반 소지)",
      desc: "퇴직금을 연간 급여에 포함하여 1/13로 분할 지급하는 방식은 대법원 판례상 무효이며, 퇴직 시 추가 정산 분쟁이 발생할 수 있는 대표적 독소 조항입니다.",
    });
  }

  // 3. 수습기간 급여 삭감 감지 ("감액 없음" 등은 제외)
  const probCheckText = normalizedText.replace(/수습[^.!?\n]{0,20}(?:감액\s*없|차등\s*없|100%\s*지급)/gi, " ");
  const probMatch = probCheckText.match(/수습.*(70%|80%|90%|차등지급|감액)/i);
  let probationReduction = false;
  if (probMatch) {
    probationReduction = true;
    warnings.push({
      type: "warning",
      title: "📉 수습기간 급여 삭감 조항 감지",
      desc: "수습 기간(최대 3개월) 동안 급여가 10~30% 삭감 지급됩니다. 단순 노무직이 아닌 경우 최저임금 준수 여부 및 정규직 100% 본채용 전환 실적을 확인하십시오.",
    });
  }

  // 4. 위약 예정 금지 위반 소지 (근로기준법 제20조)
  if (/위약금|의무\s*재직|교육비\s*반환|손해\s*배상/i.test(normalizedText)) {
    warnings.push({
      type: "warning",
      title: "⚠️ 위약 예정·의무재직 조항 의심 (근로기준법 제20조)",
      desc: "중도 퇴사 시 일정 금액 배상이나 교육비 일괄 반환을 강제하는 약정은 근로기준법 제20조(위약 예정 금지) 위반 소지가 높습니다.",
    });
  }

  // 5. 주말/야근 압박 문구
  if (/주말\s*특근|야간\s*근무|성과\s*압박|야근\s*발생|탄력근무.*(불가|제외)/i.test(normalizedText)) {
    warnings.push({
      type: "warning",
      title: "⏱️ 초과 근무 유발 및 워라밸 리스크 문구 감지",
      desc: "공고 본문에 주말 특근이나 잦은 야간 근무 가능성이 암시되어 있어 실질적인 워라밸 저하 및 체감 시급 하락 위험이 큽니다.",
    });
  }

  return {
    isClean: warnings.length === 0,
    hasFixedOT: isFixedOT,
    fixedOTHours,
    hasSeveranceSplitRisk: warnings.some((w) => w.title.includes("퇴직금")),
    probationReducedSalary: probationReduction,
    warnings,
  };
}
